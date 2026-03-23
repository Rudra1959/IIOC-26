import { useQuery as useTanstackQuery } from "@tanstack/react-query";
import { motion } from "framer-motion";
import {
	Activity,
	BarChart3,
	Droplets,
	RefreshCw,
	Sun,
	Thermometer,
	Wind,
} from "lucide-react";
import { fetchEnvironmentalSnapshot } from "#/lib/environment";
import { useEnvStore } from "#/store/envStore";
import { WindCompass } from "./WindCompass";

function formatReading(val: number | null, decimals = 0): string {
	if (val === null || val === undefined) return "--";
	return decimals > 0 ? val.toFixed(decimals) : String(Math.round(val));
}

function aqiColor(aqi: number | null): string {
	if (aqi === null) return "#6b7280";
	if (aqi <= 50) return "#22c55e";
	if (aqi <= 100) return "#eab308";
	if (aqi <= 150) return "#f97316";
	if (aqi <= 200) return "#dc2626";
	if (aqi <= 300) return "#a21caf";
	return "#7f1d1d";
}

function PollutantRow({
	label,
	value,
	unit,
	max,
	color,
}: {
	label: string;
	value: number | null;
	unit: string;
	max: number;
	color: string;
}) {
	const pct = value != null ? Math.min(100, (value / max) * 100) : 0;
	return (
		<div className="flex items-center gap-2">
			<span className="w-12 font-mono text-[9px] text-zinc-500">{label}</span>
			<div className="flex-1 overflow-hidden rounded-full bg-white/5">
				<div
					className="h-1.5 rounded-full transition-all duration-700"
					style={{ width: `${pct}%`, backgroundColor: color }}
				/>
			</div>
			<span
				className="w-14 text-right font-mono text-[9px] font-bold"
				style={{ color }}
			>
				{value != null ? formatReading(value, 1) : "--"}{" "}
				<span className="text-zinc-600 font-normal">{unit}</span>
			</span>
		</div>
	);
}

export function LiveGovPanel() {
	const userLocation = useEnvStore((s) => s.userLocation);
	const setWindData = useEnvStore((s) => s.setWindData);
	const highlightedMetric = useEnvStore((s) => s.highlightedMetric);
	const setHighlightedMetric = useEnvStore((s) => s.setHighlightedMetric);

	const query = useTanstackQuery({
		queryKey: ["liveGov", userLocation?.[0], userLocation?.[1]],
		enabled: Boolean(userLocation),
		staleTime: 60 * 1000,
		gcTime: 5 * 60 * 1000,
		refetchInterval: 60 * 1000,
		queryFn: async () => {
			if (!userLocation) throw new Error("No location");
			const data = await fetchEnvironmentalSnapshot({
				latitude: userLocation[1],
				longitude: userLocation[0],
				label: "Current",
			});
			setWindData(data.windSpeed, data.windDirection, data.windGusts);
			return data;
		},
	});

	const data = query.data;

	const dominantPollutant = (() => {
		if (!data) return null;
		const pollutants = [
			{ label: "PM2.5", value: data.pm25, max: 75, color: "#f97316" },
			{ label: "PM10", value: data.pm10, max: 150, color: "#fb923c" },
			{ label: "NO₂", value: data.nitrogenDioxide, max: 100, color: "#8b5cf6" },
			{ label: "O₃", value: data.ozone, max: 120, color: "#22c55e" },
			{ label: "SO₂", value: data.sulphurDioxide, max: 40, color: "#eab308" },
			{ label: "CO", value: data.carbonMonoxide, max: 4, color: "#6366f1" },
			{ label: "Dust", value: data.dust, max: 150, color: "#ec4899" },
		];
		return pollutants.reduce((max, p) => {
			const maxRatio = max.value ? max.value / max.max : 0;
			const pRatio = p.value ? p.value / p.max : 0;
			return pRatio > maxRatio ? p : max;
		}, pollutants[0]);
	})();

	return (
		<motion.div
			initial={{ opacity: 0, x: 30 }}
			animate={{ opacity: 1, x: 0 }}
			transition={{ duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
			className="pointer-events-auto absolute top-20 right-4 z-30"
		>
			<div
				className="flex flex-col gap-0 rounded-2xl border border-white/10 bg-black/90 shadow-2xl backdrop-blur-2xl overflow-hidden"
				style={{ width: 320, backdropFilter: "blur(20px)" }}
			>
				<div className="flex items-center justify-between border-b border-white/5 px-4 py-3">
					<div className="flex items-center gap-2">
						<div className="flex h-7 w-7 items-center justify-center rounded-lg bg-emerald-500/20">
							<Activity className="h-4 w-4 text-emerald-400" />
						</div>
						<div>
							<span className="font-mono text-[10px] font-bold uppercase tracking-widest text-emerald-400">
								Live Data
							</span>
							<p className="font-mono text-[7px] text-zinc-600">
								{data?.updatedAt
									? new Date(data.updatedAt).toLocaleTimeString()
									: "Connecting..."}
							</p>
						</div>
					</div>
					<div className="flex items-center gap-2">
						<div
							className="h-1.5 w-1.5 rounded-full"
							style={{
								backgroundColor: query.isFetching ? "#eab308" : "#22c55e",
								boxShadow: `0 0 6px ${query.isFetching ? "#eab308" : "#22c55e"}`,
							}}
						/>
						<button
							type="button"
							onClick={() => void query.refetch()}
							className="flex h-7 w-7 items-center justify-center rounded-lg border border-white/10 bg-white/5 text-zinc-500 transition-colors hover:border-white/20 hover:text-white"
						>
							<RefreshCw
								className={`h-3 w-3 ${query.isFetching ? "animate-spin" : ""}`}
							/>
						</button>
					</div>
				</div>

				<div className="p-4 space-y-4">
					<div className="flex items-start gap-4">
						<div className="text-center">
							<span
								className="font-mono text-4xl font-black leading-none"
								style={{ color: aqiColor(data?.aqi ?? null) }}
							>
								{data?.aqi != null ? Math.round(data.aqi) : "--"}
							</span>
							<p className="mt-1 font-mono text-[8px] uppercase tracking-widest text-zinc-600">
								US AQI
							</p>
							<p
								className="font-mono text-[9px] font-bold"
								style={{ color: aqiColor(data?.aqi ?? null) }}
							>
								{data?.aqiLabel ?? "Loading"}
							</p>
						</div>

						<div className="flex-1 space-y-2">
							<div className="grid grid-cols-2 gap-2">
								<button
									type="button"
									onClick={() =>
										setHighlightedMetric(
											highlightedMetric === "temperature"
												? null
												: "temperature",
										)
									}
									className={`flex items-center gap-2 rounded-lg border px-2 py-1.5 cursor-pointer text-left transition-all ${
										highlightedMetric === "temperature"
											? "border-amber-500/40 bg-amber-500/10"
											: "border-white/5 bg-white/[0.02] hover:bg-white/[0.04]"
									}`}
								>
									<Thermometer
										className={`h-3.5 w-3.5 ${highlightedMetric === "temperature" ? "text-amber-300" : "text-orange-400"}`}
									/>
									<div className="relative">
										<p className="font-mono text-[7px] text-zinc-600">Temp</p>
										<p
											className={`font-mono text-[10px] font-bold ${highlightedMetric === "temperature" ? "text-amber-300" : "text-orange-400"}`}
										>
											{formatReading(data?.temperature ?? null, 1)}°C
										</p>
										{highlightedMetric === "temperature" && (
											<div className="absolute -right-3 -top-0.5 h-1.5 w-1.5 rounded-full bg-amber-400 animate-pulse" />
										)}
									</div>
								</button>
								<button
									type="button"
									onClick={() =>
										setHighlightedMetric(
											highlightedMetric === "humidity" ? null : "humidity",
										)
									}
									className={`flex items-center gap-2 rounded-lg border px-2 py-1.5 cursor-pointer text-left transition-all ${
										highlightedMetric === "humidity"
											? "border-blue-500/40 bg-blue-500/10"
											: "border-white/5 bg-white/[0.02] hover:bg-white/[0.04]"
									}`}
								>
									<Droplets
										className={`h-3.5 w-3.5 ${highlightedMetric === "humidity" ? "text-blue-300" : "text-blue-400"}`}
									/>
									<div className="relative">
										<p className="font-mono text-[7px] text-zinc-600">
											Humidity
										</p>
										<p
											className={`font-mono text-[10px] font-bold ${highlightedMetric === "humidity" ? "text-blue-300" : "text-blue-400"}`}
										>
											{formatReading(data?.humidity ?? null)}%
										</p>
										{highlightedMetric === "humidity" && (
											<div className="absolute -right-3 -top-0.5 h-1.5 w-1.5 rounded-full bg-blue-400 animate-pulse" />
										)}
									</div>
								</button>
								<button
									type="button"
									onClick={() =>
										setHighlightedMetric(
											highlightedMetric === "wind" ? null : "wind",
										)
									}
									className={`flex items-center gap-2 rounded-lg border px-2 py-1.5 cursor-pointer text-left transition-all ${
										highlightedMetric === "wind"
											? "border-cyan-500/40 bg-cyan-500/10"
											: "border-white/5 bg-white/[0.02] hover:bg-white/[0.04]"
									}`}
								>
									<Wind
										className={`h-3.5 w-3.5 ${highlightedMetric === "wind" ? "text-cyan-300" : "text-cyan-400"}`}
									/>
									<div className="relative">
										<p className="font-mono text-[7px] text-zinc-600">Wind</p>
										<p
											className={`font-mono text-[10px] font-bold ${highlightedMetric === "wind" ? "text-cyan-300" : "text-cyan-400"}`}
										>
											{formatReading(data?.windSpeed ?? null)} km/h
										</p>
										{highlightedMetric === "wind" && (
											<div className="absolute -right-3 -top-0.5 h-1.5 w-1.5 rounded-full bg-cyan-400 animate-pulse" />
										)}
									</div>
								</button>
								<div className="flex items-center gap-2 rounded-lg border border-white/5 bg-white/[0.02] px-2 py-1.5">
									<BarChart3 className="h-3.5 w-3.5 text-yellow-400" />
									<div>
										<p className="font-mono text-[7px] text-zinc-600">
											Pressure
										</p>
										<p className="font-mono text-[10px] font-bold text-yellow-400">
											{formatReading(data?.pressure ?? null)} hPa
										</p>
									</div>
								</div>
							</div>
						</div>
					</div>

					<div className="space-y-2">
						<div className="flex items-center justify-between">
							<span className="font-mono text-[9px] uppercase tracking-widest text-zinc-600">
								Wind Direction
							</span>
							<span className="font-mono text-[9px] font-bold text-cyan-400">
								{data?.windDirection != null
									? `${Math.round(data.windDirection)}°`
									: "--"}
								{data?.windGusts != null &&
									data.windGusts > (data.windSpeed ?? 0) + 5 && (
										<span className="ml-1 text-orange-400">
											G{Math.round(data.windGusts)}
										</span>
									)}
							</span>
						</div>
						<div className="flex justify-center">
							<WindCompass
								direction={data?.windDirection ?? null}
								speed={data?.windSpeed ?? null}
								gusts={data?.windGusts ?? null}
								size={80}
							/>
						</div>
					</div>

					<div className="space-y-2">
						<div className="flex items-center justify-between">
							<span className="font-mono text-[9px] uppercase tracking-widest text-zinc-600">
								Pollutant Levels
							</span>
							{dominantPollutant && (
								<span
									className="font-mono text-[8px] font-bold"
									style={{ color: dominantPollutant.color }}
								>
									High: {dominantPollutant.label}
								</span>
							)}
						</div>
						<div className="space-y-1.5">
							<PollutantRow
								label="PM2.5"
								value={data?.pm25 ?? null}
								unit="μg/m³"
								max={75}
								color="#f97316"
							/>
							<PollutantRow
								label="PM10"
								value={data?.pm10 ?? null}
								unit="μg/m³"
								max={150}
								color="#fb923c"
							/>
							<PollutantRow
								label="NO₂"
								value={data?.nitrogenDioxide ?? null}
								unit="μg/m³"
								max={100}
								color="#8b5cf6"
							/>
							<PollutantRow
								label="O₃"
								value={data?.ozone ?? null}
								unit="μg/m³"
								max={120}
								color="#22c55e"
							/>
							<PollutantRow
								label="SO₂"
								value={data?.sulphurDioxide ?? null}
								unit="μg/m³"
								max={40}
								color="#eab308"
							/>
							<PollutantRow
								label="CO"
								value={data?.carbonMonoxide ?? null}
								unit="mg/m³"
								max={4}
								color="#6366f1"
							/>
							<PollutantRow
								label="Dust"
								value={data?.dust ?? null}
								unit="μg/m³"
								max={150}
								color="#ec4899"
							/>
						</div>
					</div>

					<div className="grid grid-cols-2 gap-2">
						<button
							type="button"
							onClick={() =>
								setHighlightedMetric(
									highlightedMetric === "pm25" ? null : "pm25",
								)
							}
							className={`flex items-center gap-2 rounded-lg border px-2 py-1.5 cursor-pointer text-left transition-all ${
								highlightedMetric === "pm25"
									? "border-orange-500/40 bg-orange-500/10"
									: "border-white/5 bg-white/[0.02] hover:bg-white/[0.04]"
							}`}
						>
							<Activity
								className={`h-3.5 w-3.5 ${highlightedMetric === "pm25" ? "text-orange-300" : "text-orange-400"}`}
							/>
							<div className="relative">
								<p className="font-mono text-[7px] text-zinc-600">PM2.5</p>
								<p
									className={`font-mono text-[10px] font-bold ${highlightedMetric === "pm25" ? "text-orange-300" : "text-orange-400"}`}
								>
									{formatReading(data?.pm25 ?? null, 1)}
								</p>
								{highlightedMetric === "pm25" && (
									<div className="absolute -right-3 -top-0.5 h-1.5 w-1.5 rounded-full bg-orange-400 animate-pulse" />
								)}
							</div>
						</button>
						<button
							type="button"
							onClick={() =>
								setHighlightedMetric(highlightedMetric === "uv" ? null : "uv")
							}
							className={`flex items-center gap-2 rounded-lg border px-2 py-1.5 cursor-pointer text-left transition-all ${
								highlightedMetric === "uv"
									? "border-yellow-500/40 bg-yellow-500/10"
									: "border-white/5 bg-white/[0.02] hover:bg-white/[0.04]"
							}`}
						>
							<Sun
								className={`h-3.5 w-3.5 ${highlightedMetric === "uv" ? "text-yellow-300" : "text-yellow-400"}`}
							/>
							<div className="relative">
								<p className="font-mono text-[7px] text-zinc-600">UV Index</p>
								<p
									className={`font-mono text-[10px] font-bold ${highlightedMetric === "uv" ? "text-yellow-300" : "text-yellow-400"}`}
								>
									{formatReading(data?.uvIndex ?? null)}
								</p>
								{highlightedMetric === "uv" && (
									<div className="absolute -right-3 -top-0.5 h-1.5 w-1.5 rounded-full bg-yellow-400 animate-pulse" />
								)}
							</div>
						</button>
					</div>

					{data?.weatherLabel && (
						<div className="flex items-center justify-center gap-2 rounded-lg border border-white/5 bg-white/[0.02] px-3 py-2">
							<span className="font-mono text-[9px] text-zinc-400">
								{data.weatherLabel}
							</span>
							<span className="text-zinc-700">|</span>
							<span className="font-mono text-[9px] text-zinc-400">
								EU AQI: {data.europeanAqi ?? "--"}
							</span>
						</div>
					)}
				</div>
			</div>
		</motion.div>
	);
}
