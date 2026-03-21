import { motion } from "framer-motion";
import {
	PolarAngleAxis,
	PolarGrid,
	PolarRadiusAxis,
	Radar,
	RadarChart,
	ResponsiveContainer,
} from "recharts";

interface ChemicalData {
	subject: string;
	value: number;
	fullMark: number;
}

interface ChemicalFingerprintProps {
	pm25?: number | null;
	pm10?: number | null;
	no2?: number | null;
	ozone?: number | null;
	so2?: number | null;
	co?: number | null;
}

export function ChemicalFingerprint({
	pm25 = 35,
	pm10 = 65,
	no2 = 40,
	ozone = 50,
	so2 = 15,
	co = 1,
}: ChemicalFingerprintProps) {
	const normalizeValue = (value: number, max: number): number => {
		return Math.min(100, (value / max) * 100);
	};

	const data: ChemicalData[] = [
		{
			subject: "PM2.5",
			value: normalizeValue(pm25 ?? 0, 150),
			fullMark: 100,
		},
		{
			subject: "PM10",
			value: normalizeValue(pm10 ?? 0, 250),
			fullMark: 100,
		},
		{
			subject: "NO₂",
			value: normalizeValue(no2 ?? 0, 100),
			fullMark: 100,
		},
		{
			subject: "O₃",
			value: normalizeValue(ozone ?? 0, 180),
			fullMark: 100,
		},
		{
			subject: "SO₂",
			value: normalizeValue(so2 ?? 0, 80),
			fullMark: 100,
		},
		{
			subject: "CO",
			value: normalizeValue(co ?? 0, 10),
			fullMark: 100,
		},
	];

	const getDominantPollutant = () => {
		const pollutants = [
			{ name: "Vehicles", value: no2 ?? 0, threshold: 40 },
			{ name: "Dust", value: pm10 ?? 0, threshold: 100 },
			{ name: "Industrial", value: so2 ?? 0, threshold: 20 },
			{ name: "Secondary", value: ozone ?? 0, threshold: 50 },
		];

		const dominant = pollutants.reduce((max, curr) =>
			curr.value / curr.threshold > max.value / max.threshold ? curr : max,
		);

		return dominant.name;
	};

	const dominantPollutant = getDominantPollutant();

	const getPollutantColor = (pollutant: string): string => {
		const colors: Record<string, string> = {
			Vehicles: "#f97316",
			Dust: "#eab308",
			Industrial: "#8b5cf6",
			Secondary: "#06b6d4",
		};
		return colors[pollutant] || "#22c55e";
	};

	return (
		<motion.div
			initial={{ opacity: 0, scale: 0.95 }}
			animate={{ opacity: 1, scale: 1 }}
			transition={{ duration: 0.4, ease: "easeOut" }}
			className="rounded-2xl border border-white/10 bg-white/5 p-4"
		>
			<div className="mb-3 flex items-center justify-between">
				<div>
					<h4 className="text-xs font-bold uppercase tracking-wider text-zinc-400">
						Atmospheric Composition
					</h4>
					<p className="mt-0.5 text-[10px] text-zinc-500">
						Chemical fingerprint analysis
					</p>
				</div>
				<div
					className="rounded-lg px-2.5 py-1 text-[10px] font-bold"
					style={{
						backgroundColor: `${getPollutantColor(dominantPollutant)}20`,
						color: getPollutantColor(dominantPollutant),
					}}
				>
					{dominantPollutant} Dominant
				</div>
			</div>

			<div className="h-48">
				<ResponsiveContainer width="100%" height="100%">
					<RadarChart
						data={data}
						margin={{ top: 5, right: 20, bottom: 5, left: 20 }}
					>
						<PolarGrid stroke="#3f3f46" strokeDasharray="3 3" />
						<PolarAngleAxis
							dataKey="subject"
							tick={{ fill: "#a1a1aa", fontSize: 10 }}
							tickLine={false}
						/>
						<PolarRadiusAxis
							angle={90}
							domain={[0, 100]}
							tick={{ fill: "#71717a", fontSize: 8 }}
							tickCount={4}
							axisLine={false}
						/>
						<Radar
							name="Pollution"
							dataKey="value"
							stroke="#22c55e"
							fill="#22c55e"
							fillOpacity={0.3}
							strokeWidth={2}
							dot={{ r: 3, fill: "#22c55e", strokeWidth: 0 }}
						/>
					</RadarChart>
				</ResponsiveContainer>
			</div>

			<div className="mt-3 grid grid-cols-3 gap-2">
				<div className="rounded-lg border border-white/5 bg-black/20 p-2">
					<p className="text-[9px] uppercase tracking-wider text-zinc-500">
						PM2.5
					</p>
					<p className="text-sm font-bold text-white">
						{pm25?.toFixed(1) ?? "--"} μg/m³
					</p>
				</div>
				<div className="rounded-lg border border-white/5 bg-black/20 p-2">
					<p className="text-[9px] uppercase tracking-wider text-zinc-500">
						PM10
					</p>
					<p className="text-sm font-bold text-white">
						{pm10?.toFixed(1) ?? "--"} μg/m³
					</p>
				</div>
				<div className="rounded-lg border border-white/5 bg-black/20 p-2">
					<p className="text-[9px] uppercase tracking-wider text-zinc-500">
						NO₂
					</p>
					<p className="text-sm font-bold text-white">
						{no2?.toFixed(1) ?? "--"} μg/m³
					</p>
				</div>
				<div className="rounded-lg border border-white/5 bg-black/20 p-2">
					<p className="text-[9px] uppercase tracking-wider text-zinc-500">
						O₃
					</p>
					<p className="text-sm font-bold text-white">
						{ozone?.toFixed(1) ?? "--"} μg/m³
					</p>
				</div>
				<div className="rounded-lg border border-white/5 bg-black/20 p-2">
					<p className="text-[9px] uppercase tracking-wider text-zinc-500">
						SO₂
					</p>
					<p className="text-sm font-bold text-white">
						{so2?.toFixed(1) ?? "--"} μg/m³
					</p>
				</div>
				<div className="rounded-lg border border-white/5 bg-black/20 p-2">
					<p className="text-[9px] uppercase tracking-wider text-zinc-500">
						CO
					</p>
					<p className="text-sm font-bold text-white">
						{co?.toFixed(2) ?? "--"} mg/m³
					</p>
				</div>
			</div>
		</motion.div>
	);
}
