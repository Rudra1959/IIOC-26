import { create } from "zustand";

interface AudioEngineState {
	isEnabled: boolean;
	isPlaying: boolean;
	volume: number;
	aqi: number;
	setEnabled: (enabled: boolean) => void;
	setVolume: (volume: number) => void;
	setAqi: (aqi: number) => void;
}

export const useAudioEngineStore = create<AudioEngineState>((set) => ({
	isEnabled: false,
	isPlaying: false,
	volume: 0.3,
	aqi: 50,
	setEnabled: (enabled) => set({ isEnabled: enabled }),
	setVolume: (volume) => set({ volume: Math.max(0, Math.min(1, volume)) }),
	setAqi: (aqi) => set({ aqi }),
}));

class AirSentinelAudio {
	private audioContext: AudioContext | null = null;
	private masterGain: GainNode | null = null;
	private droneOscillator: OscillatorNode | null = null;
	private droneGain: GainNode | null = null;
	private tensionOscillator: OscillatorNode | null = null;
	private tensionGain: GainNode | null = null;
	private noiseSource: AudioBufferSourceNode | null = null;
	private noiseGain: GainNode | null = null;
	private isInitialized = false;
	private currentAqi = 50;

	async init(): Promise<void> {
		if (this.isInitialized) return;

		try {
			this.audioContext = new AudioContext();
			this.masterGain = this.audioContext.createGain();
			this.masterGain.gain.value = 0;
			this.masterGain.connect(this.audioContext.destination);

			this.droneGain = this.audioContext.createGain();
			this.droneGain.gain.value = 0.15;
			this.droneGain.connect(this.masterGain);

			this.droneOscillator = this.audioContext.createOscillator();
			this.droneOscillator.type = "sine";
			this.droneOscillator.frequency.value = 80;
			this.droneOscillator.connect(this.droneGain);
			this.droneOscillator.start();

			this.tensionGain = this.audioContext.createGain();
			this.tensionGain.gain.value = 0;
			this.tensionGain.connect(this.masterGain);

			this.tensionOscillator = this.audioContext.createOscillator();
			this.tensionOscillator.type = "sawtooth";
			this.tensionOscillator.frequency.value = 220;
			this.tensionOscillator.connect(this.tensionGain);
			this.tensionOscillator.start();

			const bufferSize = 2 * this.audioContext.sampleRate;
			const noiseBuffer = this.audioContext.createBuffer(
				1,
				bufferSize,
				this.audioContext.sampleRate,
			);
			const output = noiseBuffer.getChannelData(0);
			for (let i = 0; i < bufferSize; i++) {
				output[i] = Math.random() * 2 - 1;
			}

			this.noiseGain = this.audioContext.createGain();
			this.noiseGain.gain.value = 0;
			this.noiseGain.connect(this.masterGain);

			this.noiseSource = this.audioContext.createBufferSource();
			this.noiseSource.buffer = noiseBuffer;
			this.noiseSource.loop = true;
			this.noiseSource.connect(this.noiseGain);
			this.noiseSource.start();

			const filter = this.audioContext.createBiquadFilter();
			filter.type = "lowpass";
			filter.frequency.value = 1000;
			this.noiseSource.disconnect();
			this.noiseSource.connect(filter);
			filter.connect(this.noiseGain);

			this.isInitialized = true;
		} catch (error) {
			console.error("Failed to initialize audio engine:", error);
		}
	}

	private mapAqiToFrequency(aqi: number): number {
		if (aqi <= 50) return 80;
		if (aqi <= 100) return 120;
		if (aqi <= 150) return 160;
		if (aqi <= 200) return 200;
		return 240;
	}

	private mapAqiToDroneVolume(aqi: number): number {
		if (aqi <= 50) return 0.1;
		if (aqi <= 100) return 0.15;
		if (aqi <= 150) return 0.2;
		if (aqi <= 200) return 0.25;
		return 0.3;
	}

	private mapAqiToTensionVolume(aqi: number): number {
		if (aqi <= 50) return 0;
		if (aqi <= 100) return 0;
		if (aqi <= 150) return 0.05;
		if (aqi <= 200) return 0.1;
		return 0.15;
	}

	private mapAqiToNoiseVolume(aqi: number): number {
		if (aqi <= 50) return 0;
		if (aqi <= 100) return 0.02;
		if (aqi <= 150) return 0.04;
		if (aqi <= 200) return 0.06;
		return 0.08;
	}

	updateAqi(aqi: number, volume: number): void {
		if (!this.isInitialized || !this.audioContext) return;

		this.currentAqi = aqi;
		const now = this.audioContext.currentTime;

		const targetFrequency = this.mapAqiToFrequency(aqi);
		const targetDroneVolume = this.mapAqiToDroneVolume(aqi) * volume;
		const targetTensionVolume = this.mapAqiToTensionVolume(aqi) * volume;
		const targetNoiseVolume = this.mapAqiToNoiseVolume(aqi) * volume;

		if (this.droneOscillator && this.droneGain) {
			this.droneOscillator.frequency.setTargetAtTime(targetFrequency, now, 2);
			this.droneGain.gain.setTargetAtTime(targetDroneVolume, now, 1);
		}

		if (this.tensionOscillator && this.tensionGain) {
			this.tensionOscillator.frequency.setTargetAtTime(
				targetFrequency * 1.5,
				now,
				2,
			);
			this.tensionGain.gain.setTargetAtTime(targetTensionVolume, now, 0.5);
		}

		if (this.noiseGain) {
			this.noiseGain.gain.setTargetAtTime(targetNoiseVolume, now, 0.5);
		}
	}

	play(volume: number): void {
		if (!this.isInitialized || !this.masterGain || !this.audioContext) return;

		if (this.audioContext.state === "suspended") {
			this.audioContext.resume();
		}

		this.masterGain.gain.setTargetAtTime(
			volume,
			this.audioContext.currentTime,
			0.5,
		);
		this.updateAqi(this.currentAqi, volume);
	}

	pause(): void {
		if (!this.isInitialized || !this.masterGain || !this.audioContext) return;
		this.masterGain.gain.setTargetAtTime(0, this.audioContext.currentTime, 0.3);
	}

	setVolume(volume: number): void {
		if (!this.masterGain || !this.audioContext) return;
		const currentVolume = this.masterGain.gain.value;
		if (currentVolume > 0) {
			this.masterGain.gain.setTargetAtTime(
				volume,
				this.audioContext.currentTime,
				0.1,
			);
		}
	}

	playAlert(): void {
		if (!this.isInitialized || !this.audioContext || !this.masterGain) return;

		const alertOsc = this.audioContext.createOscillator();
		const alertGain = this.audioContext.createGain();

		alertOsc.type = "sine";
		alertOsc.frequency.value = 880;
		alertGain.gain.value = 0.3;

		alertOsc.connect(alertGain);
		alertGain.connect(this.audioContext.destination);

		alertOsc.start();
		alertGain.gain.setTargetAtTime(0, this.audioContext.currentTime + 0.1, 0.1);
		alertOsc.stop(this.audioContext.currentTime + 0.3);
	}

	destroy(): void {
		if (this.audioContext) {
			this.audioContext.close();
			this.audioContext = null;
		}
		this.isInitialized = false;
	}
}

export const airSentinelAudio = new AirSentinelAudio();
