import { AnimatePresence, motion } from "framer-motion";
import { Music, Volume2, VolumeX } from "lucide-react";
import { useCallback, useEffect, useState } from "react";
import { airSentinelAudio, useAudioEngineStore } from "#/lib/audio-engine";

export function AudioToggle() {
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
			if (isEnabled) airSentinelAudio.setVolume(newVolume);
		},
		[isEnabled, setVolume],
	);

	const handleAqiChange = useCallback(
		(e: React.ChangeEvent<HTMLInputElement>) => {
			const newAqi = parseInt(e.target.value, 10);
			setAqi(newAqi);
			if (isEnabled) airSentinelAudio.updateAqi(newAqi, volume);
		},
		[isEnabled, volume, setAqi],
	);

	useEffect(() => {
		if (isEnabled && isInitialized) {
			airSentinelAudio.updateAqi(aqi, volume);
		}
	}, [aqi, isEnabled, isInitialized, volume]);

	const getAQIColor = (val: number) => {
		if (val <= 50) return "#22c55e";
		if (val <= 100) return "#eab308";
		if (val <= 150) return "#f97316";
		return "#dc2626";
	};

	return (
		<>
			<motion.button
				initial={{ opacity: 0, scale: 0.9 }}
				animate={{ opacity: 1, scale: 1 }}
				transition={{ duration: 0.3 }}
				type="button"
				onClick={handleToggle}
				className={`pointer-events-auto absolute bottom-20 right-4 z-30 flex h-10 w-10 items-center justify-center rounded-xl border shadow-2xl backdrop-blur-2xl transition-all ${
					isEnabled
						? "border-teal-500/50 bg-teal-500/20 text-teal-400 shadow-teal-500/20"
						: "border-white/10 bg-black/95 text-zinc-400 hover:bg-white/5"
				}`}
			>
				{isEnabled ? (
					<motion.div
						initial={{ scale: 0.8 }}
						animate={{ scale: 1 }}
						className="relative"
					>
						<Volume2 className="h-5 w-5" />
						<motion.div
							className="absolute -bottom-1 -right-1 h-2 w-2 rounded-full bg-teal-500"
							animate={{ opacity: [1, 0.5, 1] }}
							transition={{ duration: 1.5, repeat: Infinity }}
						/>
					</motion.div>
				) : (
					<VolumeX className="h-5 w-5" />
				)}
			</motion.button>

			<AnimatePresence>
				{isEnabled && (
					<motion.div
						initial={{ opacity: 0, y: 10, scale: 0.95 }}
						animate={{ opacity: 1, y: 0, scale: 1 }}
						exit={{ opacity: 0, y: 10, scale: 0.95 }}
						transition={{ duration: 0.2 }}
						className="pointer-events-auto absolute bottom-28 right-4 z-30 w-56 overflow-hidden rounded-2xl border border-teal-500/20 bg-black/95 shadow-2xl backdrop-blur-2xl"
					>
						<div className="border-b border-white/10 bg-gradient-to-r from-teal-500/10 to-cyan-500/10 p-3">
							<div className="flex items-center gap-2">
								<Music className="h-4 w-4 text-teal-400" />
								<span className="font-mono text-[10px] font-bold uppercase tracking-widest text-teal-400">
									Data Sonification
								</span>
							</div>
						</div>

						<div className="space-y-3 p-3">
							<div className="space-y-1">
								<div className="flex items-center justify-between">
									<span className="font-mono text-[8px] uppercase text-zinc-500">
										Volume
									</span>
									<span className="font-mono text-[8px] text-teal-400">
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
									className="h-1 w-full cursor-pointer appearance-none rounded-full bg-white/10"
									style={{
										background: `linear-gradient(to right, #14b8a6 ${volume * 100}%, #3f3f46 ${volume * 100}%)`,
									}}
								/>
							</div>

							<div className="space-y-1">
								<div className="flex items-center justify-between">
									<span className="font-mono text-[8px] uppercase text-zinc-500">
										Test AQI
									</span>
									<span
										className="font-mono text-[8px] font-bold"
										style={{ color: getAQIColor(aqi) }}
									>
										{aqi}
									</span>
								</div>
								<input
									type="range"
									min={0}
									max={300}
									step={1}
									value={aqi}
									onChange={handleAqiChange}
									className="h-1 w-full cursor-pointer appearance-none rounded-full bg-white/10"
									style={{
										background: `linear-gradient(to right, ${getAQIColor(aqi)} ${(aqi / 300) * 100}%, #3f3f46 ${(aqi / 300) * 100}%)`,
									}}
								/>
							</div>

							<div className="flex justify-between">
								{[0, 50, 100, 150, 200].map((v) => (
									<button
										key={v}
										type="button"
										onClick={() =>
											handleAqiChange({
												target: { value: String(v) },
											} as React.ChangeEvent<HTMLInputElement>)
										}
										className="rounded border border-white/10 bg-white/5 px-1.5 py-0.5 font-mono text-[7px] text-zinc-400 transition-colors hover:border-teal-500/30 hover:bg-teal-500/10"
									>
										{v}
									</button>
								))}
							</div>
						</div>
					</motion.div>
				)}
			</AnimatePresence>
		</>
	);
}
