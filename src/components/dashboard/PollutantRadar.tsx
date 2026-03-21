import { useMemo } from "react";
import type { AqiBand } from "#/lib/air-quality";
import { getAqiMeta } from "#/lib/air-quality";

interface PollutantData {
	pm25: number | null;
	pm10: number | null;
	nitrogenDioxide: number | null;
	ozone: number | null;
	sulphurDioxide: number | null;
	carbonMonoxide: number | null;
	dust: number | null;
}

interface PollutantRadarProps {
	data: PollutantData;
	size?: number;
}

interface PollutantConfig {
	key: keyof PollutantData;
	label: string;
	maxValue: number;
	color: string;
	unit: string;
}

const POLLUTANTS: PollutantConfig[] = [
	{
		key: "pm25",
		label: "PM2.5",
		maxValue: 75,
		color: "#f97316",
		unit: "μg/m³",
	},
	{
		key: "pm10",
		label: "PM10",
		maxValue: 150,
		color: "#fb923c",
		unit: "μg/m³",
	},
	{
		key: "nitrogenDioxide",
		label: "NO₂",
		maxValue: 100,
		color: "#8b5cf6",
		unit: "μg/m³",
	},
	{ key: "ozone", label: "O₃", maxValue: 120, color: "#22c55e", unit: "μg/m³" },
	{
		key: "sulphurDioxide",
		label: "SO₂",
		maxValue: 40,
		color: "#eab308",
		unit: "μg/m³",
	},
	{
		key: "carbonMonoxide",
		label: "CO",
		maxValue: 4,
		color: "#6366f1",
		unit: "mg/m³",
	},
	{
		key: "dust",
		label: "Dust",
		maxValue: 150,
		color: "#ec4899",
		unit: "μg/m³",
	},
];

function getValueColor(value: number, max: number): string {
	const ratio = value / max;
	if (ratio <= 0.5) return "#22c55e";
	if (ratio <= 1.0) return "#eab308";
	if (ratio <= 1.5) return "#f97316";
	return "#dc2626";
}

export function PollutantRadar({ data, size = 180 }: PollutantRadarProps) {
	const cx = size / 2;
	const cy = size / 2;
	const r = (size / 2) * 0.7;

	const { polygonPoints, values, labels } = useMemo(() => {
		const n = POLLUTANTS.length;
		const points: string[] = [];
		const vals: {
			label: string;
			value: number;
			color: string;
			pct: number;
			unit: string;
		}[] = [];

		POLLUTANTS.forEach((p, i) => {
			const rawValue = data[p.key];
			const value = rawValue ?? 0;
			const pct = Math.min(1, value / p.maxValue);
			const angle = (i / n) * Math.PI * 2 - Math.PI / 2;
			const px = cx + Math.cos(angle) * r * pct;
			const py = cy + Math.sin(angle) * r * pct;
			points.push(`${px},${py}`);
			vals.push({
				label: p.label,
				value,
				color: getValueColor(value, p.maxValue),
				pct: Math.round(pct * 100),
				unit: p.unit,
			});
		});

		const nLabel = POLLUTANTS.length;
		const lbls = POLLUTANTS.map((p, i) => {
			const angle = (i / nLabel) * Math.PI * 2 - Math.PI / 2;
			const lx = cx + Math.cos(angle) * (r + 14);
			const ly = cy + Math.sin(angle) * (r + 14);
			return { x: lx, y: ly, label: p.label };
		});

		return { polygonPoints: points.join(" "), values: vals, labels: lbls };
	}, [data, cx, cy, r]);

	const gridLevels = [0.25, 0.5, 0.75, 1.0];

	return (
		<div className="flex flex-col items-center gap-2">
			<svg
				width={size}
				height={size}
				viewBox={`0 0 ${size} ${size}`}
				className="overflow-visible"
			>
				<defs>
					<filter id="radar-glow">
						<feGaussianBlur stdDeviation="2" result="coloredBlur" />
						<feMerge>
							<feMergeNode in="coloredBlur" />
							<feMergeNode in="SourceGraphic" />
						</feMerge>
					</filter>
				</defs>

				{gridLevels.map((level) => {
					const n = POLLUTANTS.length;
					const pts = POLLUTANTS.map((_, i) => {
						const angle = (i / n) * Math.PI * 2 - Math.PI / 2;
						const px = cx + Math.cos(angle) * r * level;
						const py = cy + Math.sin(angle) * r * level;
						return `${px},${py}`;
					}).join(" ");
					return (
						<polygon
							key={level}
							points={pts}
							fill="none"
							stroke="#ffffff"
							strokeWidth={0.5}
							strokeOpacity={0.08}
						/>
					);
				})}

				{POLLUTANTS.map((_, i) => {
					const n = POLLUTANTS.length;
					const angle = (i / n) * Math.PI * 2 - Math.PI / 2;
					return (
						<line
							key={i}
							x1={cx}
							y1={cy}
							x2={cx + Math.cos(angle) * r}
							y2={cy + Math.sin(angle) * r}
							stroke="#ffffff"
							strokeWidth={0.5}
							strokeOpacity={0.1}
						/>
					);
				})}

				<polygon
					points={polygonPoints}
					fill="url(#radarFill)"
					stroke="#22c55e"
					strokeWidth={1.5}
					strokeOpacity={0.7}
					filter="url(#radar-glow)"
					opacity={0.6}
				/>

				<defs>
					<linearGradient id="radarFill" x1="0" y1="0" x2="1" y2="1">
						<stop offset="0%" stopColor="#22c55e" />
						<stop offset="50%" stopColor="#eab308" />
						<stop offset="100%" stopColor="#f97316" />
					</linearGradient>
				</defs>

				{values.map((v, i) => {
					const n = POLLUTANTS.length;
					const angle = (i / n) * Math.PI * 2 - Math.PI / 2;
					const rDot = (r * v.pct) / 100;
					const px = cx + Math.cos(angle) * rDot;
					const py = cy + Math.sin(angle) * rDot;
					return (
						<circle
							key={i}
							cx={px}
							cy={py}
							r={3}
							fill={v.color}
							opacity={0.9}
							filter="url(#radar-glow)"
						/>
					);
				})}

				{labels.map((l, i) => (
					<text
						key={i}
						x={l.x}
						y={l.y}
						textAnchor="middle"
						dominantBaseline="central"
						fill="#ffffff"
						fontSize={5.5}
						fontFamily="monospace"
						fontWeight="bold"
						opacity={0.6}
					>
						{l.label}
					</text>
				))}

				<circle
					cx={cx}
					cy={cy}
					r={2}
					fill="#09090b"
					stroke="#ffffff"
					strokeWidth={0.5}
					strokeOpacity={0.3}
				/>
			</svg>

			<div className="grid grid-cols-2 gap-x-4 gap-y-0.5">
				{values.map((v, i) => (
					<div key={i} className="flex items-center gap-1">
						<span
							className="h-1.5 w-1.5 rounded-full"
							style={{ backgroundColor: v.color }}
						/>
						<span className="font-mono text-[7px] text-zinc-500">
							{v.label}
						</span>
						<span
							className="font-mono text-[7px] font-bold"
							style={{ color: v.color }}
						>
							{v.value > 0 ? `${Math.round(v.value * 10) / 10}` : "--"}
						</span>
					</div>
				))}
			</div>
		</div>
	);
}
