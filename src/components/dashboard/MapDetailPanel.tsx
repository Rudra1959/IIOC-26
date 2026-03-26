import { motion } from "framer-motion";
import { ArrowDown, ArrowUp, Minus, X } from "lucide-react";
import { useEnvStore } from "#/store/envStore";

function getAqiColor(aqi: number): string {
	if (aqi <= 50) return "#22c55e";
	if (aqi <= 100) return "#eab308";
	if (aqi <= 150) return "#f97316";
	if (aqi <= 200) return "#dc2626";
	return "#7c3aed";
}

function getAqiLabel(aqi: number): string {
	if (aqi <= 50) return "Good";
	if (aqi <= 100) return "Moderate";
	if (aqi <= 150) return "Unhealthy for Sensitive";
	if (aqi <= 200) return "Unhealthy";
	if (aqi <= 300) return "Very Unhealthy";
	return "Hazardous";
}

export function MapDetailPanel() {
	const selectedMapPoint = useEnvStore((s) => s.selectedMapPoint);
	const setSelectedMapPoint = useEnvStore((s) => s.setSelectedMapPoint);

	if (!selectedMapPoint) return null;

	const trendIcon =
		selectedMapPoint.trend === "rising" ? (
			<ArrowUp className="h-4 w-4 text-red-400" />
		) : selectedMapPoint.trend === "falling" ? (
			<ArrowDown className="h-4 w-4 text-emerald-400" />
		) : (
			<Minus className="h-4 w-4 text-zinc-400" />
		);

	const trendLabel =
		selectedMapPoint.trend === "rising"
			? "Rising"
			: selectedMapPoint.trend === "falling"
				? "Falling"
				: "Stable";

	const aqi = selectedMapPoint.aqi ?? selectedMapPoint.score;

	return (
		<motion.div
			initial={{ opacity: 0, x: 20 }}
			animate={{ opacity: 1, x: 0 }}
			exit={{ opacity: 0, x: 20 }}
			transition={{ duration: 0.3 }}
			className="pointer-events-auto absolute right-4 top-20 z-40 w-[280px] overflow-hidden rounded-2xl border border-white/10 bg-black/90 shadow-2xl backdrop-blur-2xl"
		>
			<div className="flex items-center justify-between border-b border-white/10 bg-gradient-to-r from-emerald-500/10 to-transparent px-4 py-3">
				<div className="flex items-center gap-2">
					<span className="font-mono text-[10px] font-bold uppercase tracking-widest text-emerald-400">
						Location Details
					</span>
				</div>
				<button
					type="button"
					onClick={() => setSelectedMapPoint(null)}
					className="rounded-lg p-1 text-zinc-500 transition-colors hover:bg-white/10 hover:text-white"
				>
					<X className="h-4 w-4" />
				</button>
			</div>

			<div className="p-4">
				<div className="mb-4 flex items-center justify-between">
					<div>
						<p className="font-mono text-[24px] font-black text-white">{aqi}</p>
						<p
							className="font-mono text-[10px] font-bold"
							style={{ color: getAqiColor(aqi) }}
						>
							{getAqiLabel(aqi)}
						</p>
					</div>
					<div className="flex items-center gap-1 rounded-lg border border-white/10 bg-white/5 px-2 py-1">
						{trendIcon}
						<span className="font-mono text-[10px] text-zinc-400">
							{trendLabel}
						</span>
					</div>
				</div>

				<div className="space-y-2">
					<p className="font-mono text-[8px] uppercase tracking-widest text-zinc-500">
						Pollutants
					</p>
					<div className="grid grid-cols-2 gap-2">
						<div className="rounded-lg border border-white/10 bg-white/5 p-2">
							<p className="font-mono text-[8px] text-zinc-500">PM2.5</p>
							<p className="font-mono text-[14px] font-bold text-white">
								{selectedMapPoint.pm25 ?? Math.round(aqi * 0.6)}μg/m³
							</p>
						</div>
						<div className="rounded-lg border border-white/10 bg-white/5 p-2">
							<p className="font-mono text-[8px] text-zinc-500">PM10</p>
							<p className="font-mono text-[14px] font-bold text-white">
								{Math.round((selectedMapPoint.pm25 ?? aqi * 0.6) * 1.8)}μg/m³
							</p>
						</div>
						<div className="rounded-lg border border-white/10 bg-white/5 p-2">
							<p className="font-mono text-[8px] text-zinc-500">NO₂</p>
							<p className="font-mono text-[14px] font-bold text-white">
								{selectedMapPoint.no2 ?? Math.round(aqi * 0.3)}μg/m³
							</p>
						</div>
						<div className="rounded-lg border border-white/10 bg-white/5 p-2">
							<p className="font-mono text-[8px] text-zinc-500">O₃</p>
							<p className="font-mono text-[14px] font-bold text-white">
								{selectedMapPoint.o3 ?? Math.round(aqi * 0.4)}μg/m³
							</p>
						</div>
					</div>
				</div>

				<div className="mt-4 rounded-lg border border-white/10 bg-white/5 p-2">
					<p className="font-mono text-[8px] text-zinc-500">
						Coordinates: {selectedMapPoint.position[1].toFixed(4)}°N,{" "}
						{selectedMapPoint.position[0].toFixed(4)}°E
					</p>
				</div>
			</div>
		</motion.div>
	);
}
