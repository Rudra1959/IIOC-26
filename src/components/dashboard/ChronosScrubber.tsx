import { motion } from "framer-motion";
import {
	ChevronLeft,
	ChevronRight,
	Clock,
	Pause,
	Play,
	SkipBack,
	Wind,
} from "lucide-react";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { useEnvStore } from "#/store/envStore";

interface ForecastPoint {
	timestamp: number;
	aqi: number;
	pm25: number;
	pm10: number;
	no2: number;
	o3: number;
	windSpeed: number;
	windDirection: number;
}

interface ChronosState {
	hoursFromNow: number;
	isPlaying: boolean;
	playbackSpeed: number;
}

const INITIAL_STATE: ChronosState = {
	hoursFromNow: 0,
	isPlaying: false,
	playbackSpeed: 1,
};

function getAQIColor(aqi: number): string {
	if (aqi <= 50) return "#22c55e";
	if (aqi <= 100) return "#eab308";
	if (aqi <= 150) return "#f97316";
	if (aqi <= 200) return "#dc2626";
	if (aqi <= 300) return "#9333ea";
	return "#7f1d1d";
}

function getAQILabel(aqi: number): string {
	if (aqi <= 50) return "Good";
	if (aqi <= 100) return "Moderate";
	if (aqi <= 150) return "Unhealthy (Sensitive)";
	if (aqi <= 200) return "Unhealthy";
	if (aqi <= 300) return "Very Unhealthy";
	return "Hazardous";
}

function formatTime(timestamp: number): string {
	const date = new Date(timestamp);
	return date.toLocaleTimeString("en-US", {
		hour: "2-digit",
		minute: "2-digit",
		hour12: false,
	});
}

function formatDate(timestamp: number): string {
	const date = new Date(timestamp);
	return date.toLocaleDateString("en-US", {
		month: "short",
		day: "numeric",
	});
}

function generateMockForecast(currentAqi: number): ForecastPoint[] {
	const now = Date.now();
	const points: ForecastPoint[] = [];

	for (let h = -24; h <= 72; h++) {
		const timestamp = now + h * 60 * 60 * 1000;
		const hour = new Date(timestamp).getHours();

		const baseAqi = currentAqi + Math.sin((h / 24) * Math.PI) * 20;
		const diurnalVariation = Math.sin(((hour - 6) / 24) * Math.PI * 2) * 15;
		const noise = (Math.random() - 0.5) * 10;
		const aqi = Math.round(
			Math.max(20, Math.min(300, baseAqi + diurnalVariation + noise)),
		);

		const windSpeed = 5 + Math.random() * 15;
		const windDirection = (h * 15 + Math.random() * 30) % 360;

		points.push({
			timestamp,
			aqi,
			pm25: aqi * 0.6 + (Math.random() - 0.5) * 10,
			pm10: aqi * 0.9 + (Math.random() - 0.5) * 15,
			no2: 20 + Math.random() * 40,
			o3: 30 + Math.sin((h / 24) * Math.PI) * 20,
			windSpeed,
			windDirection,
		});
	}

	return points;
}

export function ChronosScrubber() {
	const [state, setState] = useState<ChronosState>(INITIAL_STATE);
	const [isCollapsed, setIsCollapsed] = useState(true);
	const animationRef = useRef<ReturnType<typeof setInterval> | null>(null);

	const identifiedSources = useEnvStore((s) => s.identifiedSources);
	const currentAqi = identifiedSources[0]?.aqi ?? 85;

	const forecastData = useMemo(
		() => generateMockForecast(currentAqi),
		[currentAqi],
	);

	const currentPoint = useMemo(() => {
		const targetTime = Date.now() + state.hoursFromNow * 60 * 60 * 1000;
		let closest = forecastData[0];
		let minDiff = Math.abs(closest.timestamp - targetTime);

		for (const point of forecastData) {
			const diff = Math.abs(point.timestamp - targetTime);
			if (diff < minDiff) {
				minDiff = diff;
				closest = point;
			}
		}

		return closest;
	}, [forecastData, state.hoursFromNow]);

	const nowIndex = useMemo(() => {
		const now = Date.now();
		let closest = 0;
		let minDiff = Math.abs(forecastData[0].timestamp - now);

		for (let i = 0; i < forecastData.length; i++) {
			const diff = Math.abs(forecastData[i].timestamp - now);
			if (diff < minDiff) {
				minDiff = diff;
				closest = i;
			}
		}

		return closest;
	}, [forecastData]);

	const currentIndex = useMemo(() => {
		const targetTime = Date.now() + state.hoursFromNow * 60 * 60 * 1000;
		let closest = 0;
		let minDiff = Math.abs(forecastData[0].timestamp - targetTime);

		for (let i = 0; i < forecastData.length; i++) {
			const diff = Math.abs(forecastData[i].timestamp - targetTime);
			if (diff < minDiff) {
				minDiff = diff;
				closest = i;
			}
		}

		return closest;
	}, [forecastData, state.hoursFromNow]);

	useEffect(() => {
		if (state.isPlaying) {
			animationRef.current = setInterval(() => {
				setState((prev) => {
					const newHours = prev.hoursFromNow + 1;
					if (newHours > 72) {
						return { ...prev, isPlaying: false, hoursFromNow: 72 };
					}
					return { ...prev, hoursFromNow: newHours };
				});
			}, 1000 / state.playbackSpeed);
		} else if (animationRef.current) {
			clearInterval(animationRef.current);
		}

		return () => {
			if (animationRef.current) {
				clearInterval(animationRef.current);
			}
		};
	}, [state.isPlaying, state.playbackSpeed]);

	const handleSliderChange = useCallback(
		(e: React.ChangeEvent<HTMLInputElement>) => {
			const value = parseInt(e.target.value, 10);
			setState((prev) => ({ ...prev, hoursFromNow: value, isPlaying: false }));
		},
		[],
	);

	const togglePlay = useCallback(() => {
		setState((prev) => ({ ...prev, isPlaying: !prev.isPlaying }));
	}, []);

	const skipBack = useCallback(() => {
		setState((prev) => ({
			...prev,
			hoursFromNow: Math.max(-24, prev.hoursFromNow - 6),
			isPlaying: false,
		}));
	}, []);

	const skipForward = useCallback(() => {
		setState((prev) => ({
			...prev,
			hoursFromNow: Math.min(72, prev.hoursFromNow + 6),
			isPlaying: false,
		}));
	}, []);

	const goToNow = useCallback(() => {
		setState((prev) => ({ ...prev, hoursFromNow: 0, isPlaying: false }));
	}, []);

	const changeSpeed = useCallback(() => {
		setState((prev) => {
			const speeds = [1, 2, 4];
			const currentIdx = speeds.indexOf(prev.playbackSpeed);
			const nextIdx = (currentIdx + 1) % speeds.length;
			return { ...prev, playbackSpeed: speeds[nextIdx] };
		});
	}, []);

	const isPast = state.hoursFromNow < 0;
	const isFuture = state.hoursFromNow > 0;
	const timeLabel =
		state.hoursFromNow === 0
			? "NOW"
			: isPast
				? `${Math.abs(state.hoursFromNow)}h AGO`
				: `+${state.hoursFromNow}h`;

	const aqiColor = getAQIColor(currentPoint.aqi);
	const sliderPercent = (currentIndex / (forecastData.length - 1)) * 100;

	return (
		<>
			{isCollapsed ? (
				<motion.button
					initial={{ opacity: 0, y: 20 }}
					animate={{ opacity: 1, y: 0 }}
					transition={{ duration: 0.3 }}
					type="button"
					onClick={() => setIsCollapsed(false)}
					className="pointer-events-auto absolute bottom-20 left-1/2 z-30 flex -translate-x-1/2 items-center gap-3 rounded-2xl border border-cyan-500/20 bg-black/95 px-4 py-2.5 shadow-2xl backdrop-blur-2xl transition-colors hover:bg-white/[0.03] group"
				>
					<Clock className="h-4 w-4 text-cyan-400" />
					<div className="flex items-center gap-2">
						<span className="font-mono text-[10px] font-bold uppercase tracking-widest text-cyan-400">
							Chronos
						</span>
						<span className="font-mono text-[9px] text-zinc-500">
							Click to expand timeline
						</span>
					</div>
					<ChevronRight className="h-3.5 w-3.5 text-cyan-400" />
				</motion.button>
			) : (
				<motion.div
					initial={{ opacity: 0, y: 20, scale: 0.97 }}
					animate={{ opacity: 1, y: 0, scale: 1 }}
					exit={{ opacity: 0, y: 20, scale: 0.97 }}
					transition={{ duration: 0.4, ease: [0.16, 1, 0.3, 1] }}
					className="pointer-events-auto absolute bottom-20 left-1/2 z-30 w-[600px] -translate-x-1/2 rounded-2xl border border-cyan-500/20 bg-black/95 text-white shadow-2xl backdrop-blur-2xl"
				>
					<div className="flex flex-col gap-3 p-4">
						<div className="flex items-center justify-between">
							<div className="flex items-center gap-3">
								<div className="flex h-8 w-8 items-center justify-center rounded-lg bg-cyan-500/20">
									<Clock className="h-4 w-4 text-cyan-400" />
								</div>
								<div>
									<h3 className="font-mono text-[11px] font-bold uppercase tracking-[0.2em] text-cyan-400">
										Chronos Scrubber
									</h3>
									<p className="font-mono text-[9px] text-zinc-500">
										Temporal AQI Visualization
									</p>
								</div>
							</div>

							<div className="flex items-center gap-2">
								<div className="flex items-center gap-1 rounded-lg border border-white/10 bg-white/5 px-2 py-1">
									<button
										type="button"
										onClick={changeSpeed}
										className="font-mono text-[9px] font-bold text-cyan-400 transition-colors hover:text-cyan-300"
									>
										{state.playbackSpeed}x
									</button>
								</div>
								<button
									type="button"
									onClick={goToNow}
									className="rounded-lg p-1.5 text-zinc-500 transition-colors hover:bg-white/10 hover:text-white"
									title="Go to now"
								>
									<SkipBack className="h-3.5 w-3.5" />
								</button>
								<button
									type="button"
									onClick={skipBack}
									className="rounded-lg p-1.5 text-zinc-500 transition-colors hover:bg-white/10 hover:text-white"
									title="Skip back 6h"
								>
									<ChevronLeft className="h-3.5 w-3.5" />
								</button>
								<button
									type="button"
									onClick={togglePlay}
									className="flex h-8 w-8 items-center justify-center rounded-lg bg-cyan-500/20 text-cyan-400 transition-colors hover:bg-cyan-500/30"
								>
									{state.isPlaying ? (
										<Pause className="h-4 w-4" />
									) : (
										<Play className="h-4 w-4" />
									)}
								</button>
								<button
									type="button"
									onClick={skipForward}
									className="rounded-lg p-1.5 text-zinc-500 transition-colors hover:bg-white/10 hover:text-white"
									title="Skip forward 6h"
								>
									<ChevronRight className="h-3.5 w-3.5" />
								</button>
								<button
									type="button"
									onClick={() => setIsCollapsed(true)}
									className="rounded-lg p-1.5 text-zinc-500 transition-colors hover:bg-white/10 hover:text-white"
									title="Minimize"
								>
									<ChevronLeft className="h-3.5 w-3.5" />
								</button>
							</div>
						</div>

						<div className="grid grid-cols-3 gap-3">
							<div className="rounded-lg border border-cyan-500/20 bg-cyan-500/5 p-3 text-center">
								<p className="font-mono text-[8px] uppercase tracking-widest text-cyan-400/60">
									Current AQI
								</p>
								<p
									className="mt-1 font-mono text-2xl font-black"
									style={{ color: aqiColor }}
								>
									{currentPoint.aqi}
								</p>
								<p className="font-mono text-[9px]" style={{ color: aqiColor }}>
									{getAQILabel(currentPoint.aqi)}
								</p>
							</div>

							<div className="rounded-lg border border-white/10 bg-white/5 p-3 text-center">
								<p className="font-mono text-[8px] uppercase tracking-widest text-zinc-400/60">
									{isPast ? "Past" : isFuture ? "Forecast" : "Now"}
								</p>
								<p className="mt-1 font-mono text-lg font-black text-white">
									{formatDate(currentPoint.timestamp)}
								</p>
								<p className="font-mono text-[10px] text-zinc-400">
									{formatTime(currentPoint.timestamp)}
								</p>
							</div>

							<div className="rounded-lg border border-white/10 bg-white/5 p-3 text-center">
								<div className="flex items-center justify-center gap-1">
									<Wind className="h-3 w-3 text-sky-400" />
									<p className="font-mono text-[8px] uppercase tracking-widest text-zinc-400/60">
										Wind
									</p>
								</div>
								<p className="mt-1 font-mono text-lg font-black text-sky-400">
									{Math.round(currentPoint.windSpeed)} km/h
								</p>
								<p className="font-mono text-[10px] text-zinc-400">
									{Math.round(currentPoint.windDirection)}°
								</p>
							</div>
						</div>

						<div className="relative">
							<div className="mb-1 flex items-center justify-between font-mono text-[8px] text-zinc-500">
								<span>-24h</span>
								<span
									className={`font-bold ${state.hoursFromNow === 0 ? "text-cyan-400" : isPast ? "text-amber-400" : "text-emerald-400"}`}
								>
									{timeLabel}
								</span>
								<span>+72h</span>
							</div>

							<div className="relative h-12">
								<div className="absolute inset-0 rounded-lg bg-white/5" />

								<div
									className="absolute top-0 h-full rounded-lg transition-all duration-300"
									style={{
										left: "0%",
										width: `${sliderPercent}%`,
										background: `linear-gradient(90deg, transparent, ${aqiColor}30)`,
									}}
								/>

								<div
									className="absolute top-1/2 h-2 w-2 -translate-x-1/2 -translate-y-1/2 rounded-full bg-cyan-400 shadow-lg shadow-cyan-400/50"
									style={{ left: `${sliderPercent}%` }}
								/>

								<div
									className="pointer-events-none absolute top-1/2 h-3 w-3 -translate-x-1/2 -translate-y-1/2 rounded-full border-2 border-cyan-400"
									style={{
										left: `${(nowIndex / (forecastData.length - 1)) * 100}%`,
									}}
								/>

								<input
									type="range"
									min={-24}
									max={72}
									step={1}
									value={state.hoursFromNow}
									onChange={handleSliderChange}
									className="absolute inset-0 h-full w-full cursor-pointer opacity-0"
								/>

								<div className="absolute bottom-0 left-0 right-0 flex justify-between px-1">
									{[-24, -12, 0, 12, 24, 36, 48, 60, 72].map((hour) => {
										const index = hour + 24;
										const point =
											forecastData[Math.min(index, forecastData.length - 1)];
										const percent = (index / (forecastData.length - 1)) * 100;

										return (
											<div
												key={hour}
												className="flex flex-col items-center"
												style={{
													position: "absolute",
													left: `${percent}%`,
													transform: "translateX(-50%)",
												}}
											>
												<div
													className="h-2 w-1 rounded-full"
													style={{ backgroundColor: getAQIColor(point.aqi) }}
												/>
												<span className="mt-0.5 font-mono text-[6px] text-zinc-600">
													{hour >= 0 ? `+${hour}` : hour}h
												</span>
											</div>
										);
									})}
								</div>
							</div>

							<div className="mt-2 flex items-center justify-between font-mono text-[7px] text-zinc-600">
								<span>Wind-driven PM2.5 dispersion model</span>
								<span className="flex items-center gap-1">
									<span className="h-1.5 w-1.5 rounded-full border border-cyan-400" />
									Now marker
								</span>
							</div>
						</div>
					</div>
				</motion.div>
			)}
		</>
	);
}
