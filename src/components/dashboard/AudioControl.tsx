import { motion } from "framer-motion";
import { AlertTriangle, Music, Volume2, VolumeX } from "lucide-react";
import { useCallback, useEffect, useState } from "react";
import { airSentinelAudio, useAudioEngineStore } from "#/lib/audio-engine";

export function AudioControl() {
	const [isInitialized, setIsInitialized] = useState(false);
	const isEnabled = useAudioEngineStore((s) => s.isEnabled);
	const volume = useAudioEngineStore((s) => s.volume);
	const aqi = useAudioEngineStore((s) => s.aqi);
	const setEnabled = useAudioEngineStore((s) => s.setEnabled);
	const setVolume = useAudioEngineStore((s) => s.setVolume);
	const setAqi = useAudioEngineStore((s) => s.setAqi);

	const handleInit = useCallback(async () => {
		if (!isInitialized) {
			await airSentinelAudio.init();
			setIsInitialized(true);
		}
	}, [isInitialized]);

	const handleToggle = useCallback(async () => {
		if (!isInitialized) {
			await handleInit();
		}

		if (isEnabled) {
			airSentinelAudio.pause();
			setEnabled(false);
		} else {
			airSentinelAudio.play(volume);
			setEnabled(true);
		}
	}, [isEnabled, isInitialized, handleInit, volume, setEnabled]);

	const handleVolumeChange = useCallback(
		(e: React.ChangeEvent<HTMLInputElement>) => {
			const newVolume = parseFloat(e.target.value);
			setVolume(newVolume);
			if (isEnabled) {
				airSentinelAudio.setVolume(newVolume);
			}
		},
		[isEnabled, setVolume],
	);

	const handleAqiChange = useCallback(
		(e: React.ChangeEvent<HTMLInputElement>) => {
			const newAqi = parseInt(e.target.value, 10);
			setAqi(newAqi);
			if (isEnabled) {
				airSentinelAudio.updateAqi(newAqi, volume);
			}
		},
		[isEnabled, volume, setAqi],
	);

	useEffect(() => {
		if (isEnabled && isInitialized) {
			airSentinelAudio.updateAqi(aqi, volume);
		}
	}, [aqi, isEnabled, isInitialized, volume]);

	useEffect(() => {
		return () => {
			airSentinelAudio.destroy();
		};
	}, []);

	const getAQIColor = (aqiValue: number) => {
		if (aqiValue <= 50) return "#22c55e";
		if (aqiValue <= 100) return "#eab308";
		if (aqiValue <= 150) return "#f97316";
		return "#dc2626";
	};

	const getAQILabel = (aqiValue: number) => {
		if (aqiValue <= 50) return "Good";
		if (aqiValue <= 100) return "Moderate";
		if (aqiValue <= 150) return "Unhealthy";
		if (aqiValue <= 200) return "Very Unhealthy";
		return "Hazardous";
	};

	return (
		<motion.div
			initial={{ opacity: 0, y: 20 }}
			animate={{ opacity: 1, y: 0 }}
			transition={{ duration: 0.4, ease: "easeOut" }}
			className="pointer-events-auto rounded-2xl border border-purple-500/20 bg-black/95 p-4 shadow-2xl backdrop-blur-2xl"
		>
			<div className="mb-3 flex items-center justify-between">
				<div className="flex items-center gap-2">
					<div className="flex h-8 w-8 items-center justify-center rounded-lg bg-purple-500/20">
						<Music className="h-4 w-4 text-purple-400" />
					</div>
					<div>
						<h4 className="font-mono text-[11px] font-bold uppercase tracking-wider text-purple-400">
							Data Sonification
						</h4>
						<p className="font-mono text-[9px] text-zinc-500">
							Environmental audio engine
						</p>
					</div>
				</div>
				<button
					type="button"
					onClick={handleToggle}
					className={`flex h-8 w-8 items-center justify-center rounded-lg transition-all ${
						isEnabled
							? "bg-purple-500/30 text-purple-400 hover:bg-purple-500/40"
							: "bg-white/10 text-zinc-400 hover:bg-white/20 hover:text-white"
					}`}
				>
					{isEnabled ? (
						<Volume2 className="h-4 w-4" />
					) : (
						<VolumeX className="h-4 w-4" />
					)}
				</button>
			</div>

			<div className="space-y-3">
				<div className="space-y-1.5">
					<div className="flex items-center justify-between">
						<span className="font-mono text-[9px] uppercase tracking-wider text-zinc-500">
							Volume
						</span>
						<span className="font-mono text-[9px] text-purple-400">
							{Math.round(volume * 100)}%
						</span>
					</div>
					<input
						type="range"
						min={0}
						max={1}
						step={0.01}
						value={volume}
						onChange={handleVolumeChange}
						className="h-1.5 w-full cursor-pointer appearance-none rounded-full bg-white/10"
						style={{
							background: `linear-gradient(to right, #a855f7 ${volume * 100}%, #3f3f46 ${volume * 100}%)`,
						}}
					/>
				</div>

				<div className="space-y-1.5">
					<div className="flex items-center justify-between">
						<span className="font-mono text-[9px] uppercase tracking-wider text-zinc-500">
							Test AQI
						</span>
						<span
							className="font-mono text-[9px] font-bold"
							style={{ color: getAQIColor(aqi) }}
						>
							{aqi} - {getAQILabel(aqi)}
						</span>
					</div>
					<input
						type="range"
						min={0}
						max={300}
						step={1}
						value={aqi}
						onChange={handleAqiChange}
						className="h-1.5 w-full cursor-pointer appearance-none rounded-full bg-white/10"
						style={{
							background: `linear-gradient(to right, ${getAQIColor(aqi)} ${(aqi / 300) * 100}%, #3f3f46 ${(aqi / 300) * 100}%)`,
						}}
					/>
				</div>

				<div className="grid grid-cols-5 gap-1">
					{[0, 50, 100, 150, 200].map((testAqi) => (
						<button
							key={testAqi}
							type="button"
							onClick={() =>
								handleAqiChange({
									target: { value: String(testAqi) },
								} as React.ChangeEvent<HTMLInputElement>)
							}
							className="rounded border border-white/10 bg-white/5 px-1 py-0.5 font-mono text-[7px] text-zinc-400 transition-colors hover:border-white/20 hover:bg-white/10"
						>
							{testAqi}
						</button>
					))}
				</div>

				<div className="rounded border border-white/10 bg-white/5 p-2">
					<div className="mb-1.5 flex items-center justify-between">
						<span className="font-mono text-[8px] uppercase tracking-wider text-zinc-500">
							Audio Mapping
						</span>
					</div>
					<div className="space-y-1">
						<div className="flex items-center justify-between font-mono text-[8px]">
							<span className="text-zinc-500">AQI 0-50</span>
							<span className="text-emerald-400">80Hz calm drone</span>
						</div>
						<div className="flex items-center justify-between font-mono text-[8px]">
							<span className="text-zinc-500">AQI 51-100</span>
							<span className="text-yellow-400">120Hz tension layer</span>
						</div>
						<div className="flex items-center justify-between font-mono text-[8px]">
							<span className="text-zinc-500">AQI 101-150</span>
							<span className="text-orange-400">160Hz + white noise</span>
						</div>
						<div className="flex items-center justify-between font-mono text-[8px]">
							<span className="text-zinc-500">AQI 151-200</span>
							<span className="text-red-400">200Hz warning drone</span>
						</div>
						<div className="flex items-center justify-between font-mono text-[8px]">
							<span className="text-zinc-500">AQI 201+</span>
							<span className="text-red-600">240Hz + alarm bursts</span>
						</div>
					</div>
				</div>

				<div className="flex items-center gap-1.5 rounded bg-purple-500/10 px-2 py-1.5 font-mono text-[8px] text-purple-300">
					<AlertTriangle className="h-3 w-3 flex-shrink-0" />
					<span>
						Audio requires user interaction to start due to browser autoplay
						policies
					</span>
				</div>
			</div>
		</motion.div>
	);
}
