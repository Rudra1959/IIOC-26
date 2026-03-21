import { AnimatePresence, motion } from "framer-motion";
import {
	AlertTriangle,
	ArrowRight,
	Compass,
	Droplets,
	Gauge,
	Layers,
	Navigation,
	Thermometer,
	Wind,
	X,
} from "lucide-react";
import { useEffect, useState } from "react";
import {
	PolarAngleAxis,
	PolarGrid,
	PolarRadiusAxis,
	Radar,
	RadarChart,
	ResponsiveContainer,
} from "recharts";
import { useEnvStore } from "#/store/envStore";

interface HexagonData {
	score: number;
	position: [number, number];
	trend: "rising" | "stable" | "falling";
}

function getDominantThreatLabel(data: HexagonData): string {
	const hash = (data.position[0] * 1000 + data.position[1] * 100) % 4;
	if (hash === 0) return "Dominant Threat: Vehicular Exhaust";
	if (hash === 1) return "Dominant Threat: Road/Site Dust";
	if (hash === 2) return "Dominant Threat: Ground-Level Ozone";
	return "Dominant Threat: Industrial Sulfates";
}

function getDominantColor(label: string): string {
	if (label.includes("Vehicular")) return "#f97316";
	if (label.includes("Dust")) return "#eab308";
	if (label.includes("Ozone")) return "#06b6d4";
	return "#8b5cf6";
}

function getThreatData(score: number) {
	const scale = score / 100;
	return [
		{ subject: "PM2.5", value: Math.round(60 + scale * 40), fullMark: 100 },
		{ subject: "PM10", value: Math.round(50 + scale * 45), fullMark: 100 },
		{ subject: "NO\u2082", value: Math.round(40 + scale * 55), fullMark: 100 },
		{ subject: "O\u2083", value: Math.round(35 + scale * 50), fullMark: 100 },
		{ subject: "SO\u2082", value: Math.round(20 + scale * 30), fullMark: 100 },
		{ subject: "CO", value: Math.round(30 + scale * 40), fullMark: 100 },
	];
}

function CompassWidget({ direction }: { direction: number }) {
	return (
		<div className="relative flex items-center justify-center">
			<svg
				viewBox="0 0 100 100"
				className="h-16 w-16"
				aria-label={`Wind compass showing ${direction} degrees`}
			>
				<title>Wind Compass</title>
				<circle
					cx="50"
					cy="50"
					r="45"
					fill="none"
					stroke="rgba(255,255,255,0.1)"
					strokeWidth="2"
				/>
				<circle cx="50" cy="50" r="3" fill="rgba(255,255,255,0.3)" />
				<g transform={`rotate(${direction} 50 50)`}>
					<polygon points="50,8 46,50 54,50" fill="#ef4444" opacity="0.9" />
					<polygon points="50,92 46,50 54,50" fill="rgba(255,255,255,0.4)" />
				</g>
				<text
					x="50"
					y="6"
					textAnchor="middle"
					fill="rgba(255,255,255,0.5)"
					fontSize="6"
				>
					N
				</text>
				<text
					x="50"
					y="99"
					textAnchor="middle"
					fill="rgba(255,255,255,0.3)"
					fontSize="6"
				>
					S
				</text>
				<text
					x="4"
					y="53"
					textAnchor="middle"
					fill="rgba(255,255,255,0.3)"
					fontSize="6"
				>
					W
				</text>
				<text
					x="96"
					y="53"
					textAnchor="middle"
					fill="rgba(255,255,255,0.3)"
					fontSize="6"
				>
					E
				</text>
			</svg>
			<span className="absolute text-[10px] font-bold text-emerald-400">
				{Math.round(direction)}\u00B0
			</span>
		</div>
	);
}

export function HexagonDetailPanel() {
	const clickedHexPosition = useEnvStore((s) => s.clickedHexPosition);
	const setClickedHexPosition = useEnvStore((s) => s.setClickedHexPosition);
	const setGreenDestination = useEnvStore((s) => s.setGreenDestination);
	const setMapFocus = useEnvStore((s) => s.setMapFocus);

	const [hexData] = useState<HexagonData>(() => ({
		score: 65 + Math.round(Math.random() * 30),
		position: [Math.random() * 0.1 - 0.05, Math.random() * 0.1 - 0.05],
		trend: "rising" as const,
	}));

	const threatLabel = getDominantThreatLabel(hexData);
	const threatColor = getDominantColor(threatLabel);
	const radarData = getThreatData(hexData.score);
	const windDir = 180 + Math.round(Math.random() * 120);

	useEffect(() => {
		if (clickedHexPosition) {
			const timer = setTimeout(() => {
				setClickedHexPosition(null);
			}, 8000);
			return () => clearTimeout(timer);
		}
	}, [clickedHexPosition, setClickedHexPosition]);

	if (!clickedHexPosition) return null;

	return (
		<AnimatePresence>
			<motion.div
				initial={{ opacity: 0, scale: 0.9, x: -20 }}
				animate={{ opacity: 1, scale: 1, x: 0 }}
				exit={{ opacity: 0, scale: 0.9, x: -20 }}
				transition={{ duration: 0.25, ease: "easeOut" }}
				className="pointer-events-auto absolute right-4 top-40 z-30 w-80 rounded-2xl border border-white/10 bg-[#09090b]/90 p-4 shadow-2xl backdrop-blur-2xl panel-glass"
			>
				<div className="mb-3 flex items-center justify-between">
					<div className="flex items-center gap-2">
						<div className="flex h-7 w-7 items-center justify-center rounded-lg bg-emerald-500/20">
							<Layers className="h-4 w-4 text-emerald-400" />
						</div>
						<h4 className="text-sm font-bold text-white">Zone Intelligence</h4>
					</div>
					<button
						type="button"
						onClick={() => setClickedHexPosition(null)}
						className="rounded-lg p-1 text-zinc-400 transition-colors hover:bg-white/10 hover:text-white"
					>
						<X className="h-4 w-4" />
					</button>
				</div>

				<div
					className="mb-3 rounded-xl border px-3 py-2 text-center text-xs font-bold"
					style={{
						borderColor: `${threatColor}40`,
						backgroundColor: `${threatColor}15`,
						color: threatColor,
					}}
				>
					{threatLabel}
				</div>

				<div className="mb-3 grid grid-cols-3 gap-2">
					<div className="flex flex-col items-center rounded-lg border border-white/10 bg-white/5 p-2">
						<Gauge className="mb-1 h-4 w-4 text-red-400" />
						<span className="text-lg font-black text-white">
							{hexData.score}
						</span>
						<span className="text-[9px] uppercase tracking-wider text-zinc-500">
							AQI
						</span>
					</div>
					<div className="flex flex-col items-center rounded-lg border border-white/10 bg-white/5 p-2">
						<Compass className="mb-1 h-4 w-4 text-sky-400" />
						<CompassWidget direction={windDir} />
						<span className="text-[9px] uppercase tracking-wider text-zinc-500">
							Wind
						</span>
					</div>
					<div className="flex flex-col items-center rounded-lg border border-white/10 bg-white/5 p-2">
						<AlertTriangle
							className={`mb-1 h-4 w-4 ${hexData.trend === "rising" ? "text-red-400 animate-pulse" : "text-zinc-400"}`}
						/>
						<span className="text-lg font-black capitalize text-white">
							{hexData.trend}
						</span>
						<span className="text-[9px] uppercase tracking-wider text-zinc-500">
							Trend
						</span>
					</div>
				</div>

				<div className="mb-3 h-36">
					<ResponsiveContainer width="100%" height="100%">
						<RadarChart
							data={radarData}
							margin={{ top: 5, right: 15, bottom: 5, left: 15 }}
						>
							<PolarGrid stroke="#3f3f46" strokeDasharray="2 2" />
							<PolarAngleAxis
								dataKey="subject"
								tick={{ fill: "#a1a1aa", fontSize: 9 }}
								tickLine={false}
							/>
							<PolarRadiusAxis
								angle={90}
								domain={[0, 100]}
								tick={false}
								axisLine={false}
							/>
							<Radar
								name="Threat Level"
								dataKey="value"
								stroke={threatColor}
								fill={threatColor}
								fillOpacity={0.25}
								strokeWidth={2}
							/>
						</RadarChart>
					</ResponsiveContainer>
				</div>

				<div className="mb-3 grid grid-cols-2 gap-2">
					{[
						{
							icon: <Wind className="h-3 w-3 text-sky-400" />,
							label: "Wind",
							value: `${12 + Math.round(Math.random() * 8)} km/h`,
						},
						{
							icon: <Thermometer className="h-3 w-3 text-orange-400" />,
							label: "Temp",
							value: `${22 + Math.round(Math.random() * 8)}\u00B0C`,
						},
						{
							icon: <Droplets className="h-3 w-3 text-blue-400" />,
							label: "Humidity",
							value: `${50 + Math.round(Math.random() * 30)}%`,
						},
						{
							icon: <Layers className="h-3 w-3 text-emerald-400" />,
							label: "Coverage",
							value: `${70 + Math.round(Math.random() * 25)}%`,
						},
					].map((stat) => (
						<div
							key={stat.label}
							className="flex items-center gap-2 rounded-lg border border-white/5 bg-black/20 px-2 py-1.5"
						>
							{stat.icon}
							<div>
								<p className="text-[9px] text-zinc-500">{stat.label}</p>
								<p className="text-xs font-semibold text-white">{stat.value}</p>
							</div>
						</div>
					))}
				</div>

				<button
					type="button"
					onClick={() => {
						setGreenDestination({
							name: "Nearest Clean Zone",
							coordinates: [
								hexData.position[0] + 0.015,
								hexData.position[1] - 0.01,
							],
							distanceKm: 1.2,
							note: "Detected via wind vector analysis",
						});
						setMapFocus("green");
					}}
					className="flex w-full items-center justify-between rounded-xl border border-emerald-500/30 bg-gradient-to-r from-emerald-500/10 to-transparent px-4 py-2.5 text-sm font-bold text-emerald-400 transition-all hover:border-emerald-500/60 hover:from-emerald-500/20"
				>
					<div className="flex items-center gap-2">
						<Navigation className="h-4 w-4" />
						Navigate to Clean Zone
					</div>
					<ArrowRight className="h-4 w-4" />
				</button>
			</motion.div>
		</AnimatePresence>
	);
}
