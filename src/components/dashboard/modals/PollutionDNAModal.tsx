import { useState } from "react";
import { Modal } from "#/components/ui/Modal";

const POLLUTANTS = [
	{
		name: "PM2.5",
		value: 35,
		max: 75,
		color: "#f97316",
		health: "Respiratory",
	},
	{
		name: "PM10",
		value: 65,
		max: 150,
		color: "#eab308",
		health: "Cardiovascular",
	},
	{ name: "NO₂", value: 40, max: 80, color: "#38bdf8", health: "Pulmonary" },
	{ name: "O₃", value: 50, max: 100, color: "#22c55e", health: "Oxidative" },
	{ name: "SO₂", value: 15, max: 40, color: "#a78bfa", health: "Bronchial" },
	{ name: "CO", value: 8, max: 20, color: "#ec4899", health: "Cerebral" },
];

const DIURNAL = [
	30, 28, 25, 22, 20, 22, 35, 55, 72, 82, 88, 92, 85, 78, 68, 60, 55, 50, 48,
	46, 42, 38, 35, 32,
];

const REACTIONS = [
	{ from: "SO₂", arrow: "+", to: "NOₓ", product: "→ PM2.5", color: "#f97316" },
	{ from: "VOC", arrow: "+", to: "NOₓ", product: "→ O₃", color: "#22c55e" },
	{
		from: "NH₃",
		arrow: "+",
		to: "SO₂",
		product: "→ (NH₄)₂SO₄",
		color: "#a78bfa",
	},
];

export function PollutionDNAModal() {
	const [showReactions, setShowReactions] = useState(false);
	const totalScore = POLLUTANTS.reduce((sum, p) => sum + p.value / p.max, 0);
	const avgRatio = totalScore / POLLUTANTS.length;

	return (
		<Modal
			id="pollutionDNA"
			title="Pollution DNA"
			icon={<span>🧬</span>}
			accentColor="#8b5cf6"
			size="lg"
		>
			<div className="space-y-4">
				<div className="relative flex justify-center">
					<svg viewBox="0 0 160 280" className="h-64 w-full max-w-[200px]">
						<defs>
							<filter id="dnaGlow">
								<feGaussianBlur stdDeviation="2" result="blur" />
								<feMerge>
									<feMergeNode in="blur" />
									<feMergeNode in="SourceGraphic" />
								</feMerge>
							</filter>
						</defs>

						{POLLUTANTS.map((p, i) => {
							const y = 20 + i * 44;
							const offset = i % 2 === 0 ? 30 : -30;
							const alpha = p.value / p.max;
							return (
								<g key={p.name} filter="url(#dnaGlow)">
									<line
										x1={80 - offset}
										y1={y}
										x2={80 + offset}
										y2={y + 40}
										stroke={p.color}
										strokeWidth={1 + alpha * 2}
										strokeOpacity={0.3 + alpha * 0.7}
									/>
									<circle
										cx={80 - offset}
										cy={y}
										r={3 + alpha * 4}
										fill={p.color}
										fillOpacity={0.5 + alpha * 0.5}
									>
										<animate
											attributeName="opacity"
											values={`${0.5 + alpha * 0.5};0.2;${0.5 + alpha * 0.5}`}
											dur={`${2 + i * 0.3}s`}
											repeatCount="indefinite"
										/>
									</circle>
									<circle
										cx={80 + offset}
										cy={y + 40}
										r={3 + alpha * 3}
										fill={p.color}
										fillOpacity={0.4 + alpha * 0.4}
									/>
									<text
										x={i % 2 === 0 ? 20 : 130}
										y={y + 5}
										className="fill-white"
										fontSize="6"
										fontFamily="monospace"
										fontWeight="bold"
									>
										{p.name}
									</text>
								</g>
							);
						})}
					</svg>
				</div>

				<div className="grid grid-cols-2 gap-1.5">
					{POLLUTANTS.map((p) => (
						<div
							key={p.name}
							className="flex items-center gap-2 rounded border border-white/5 bg-white/[0.02] px-3 py-1.5"
						>
							<div
								className="h-2 w-2 rounded-full"
								style={{ backgroundColor: p.color }}
							/>
							<span className="font-mono text-[10px] text-zinc-400">
								{p.name}
							</span>
							<span
								className="ml-auto font-mono text-[10px] font-black"
								style={{ color: p.color }}
							>
								{p.value}
							</span>
						</div>
					))}
				</div>

				<div className="space-y-1">
					<p className="font-mono text-[9px] uppercase tracking-widest text-zinc-500">
						24h Diurnal Cycle
					</p>
					<svg viewBox="0 0 300 50" className="w-full">
						<path
							d={
								`M0,${50 - (DIURNAL[0] / 100) * 50} ` +
								DIURNAL.map(
									(v, i) => `L${i * (300 / 24)},${50 - (v / 100) * 50}`,
								).join(" ")
							}
							fill="none"
							stroke="#8b5cf6"
							strokeWidth="1.5"
						/>
						{DIURNAL.map((v, i) => (
							<circle
								key={i}
								cx={i * (300 / 24)}
								cy={50 - (v / 100) * 50}
								r={i === 12 ? 3 : 1.5}
								fill="#8b5cf6"
								fillOpacity={v / 100}
							/>
						))}
						<text
							x="155"
							y="45"
							textAnchor="middle"
							className="fill-zinc-600"
							fontSize="6"
							fontFamily="monospace"
						>
							Peak: 12PM ({Math.max(...DIURNAL)} AQI)
						</text>
					</svg>
				</div>

				<div className="grid grid-cols-3 gap-2">
					{[
						{
							label: "Fingerprint",
							value:
								avgRatio > 0.8
									? "Steel/Dust"
									: avgRatio > 0.5
										? "Mixed"
										: "Vehicular",
							color: "#8b5cf6",
						},
						{
							label: "Health Risk",
							value: avgRatio > 0.8 ? "HIGH" : avgRatio > 0.5 ? "MOD" : "LOW",
							color: avgRatio > 0.8 ? "#dc2626" : "#eab308",
						},
						{ label: "Primary Source", value: "Industrial", color: "#f97316" },
					].map((item) => (
						<div
							key={item.label}
							className="rounded border border-white/5 bg-white/[0.03] p-2 text-center"
						>
							<p className="font-mono text-[8px] uppercase tracking-widest text-zinc-600">
								{item.label}
							</p>
							<p
								className="font-mono text-[11px] font-black"
								style={{ color: item.color }}
							>
								{item.value}
							</p>
						</div>
					))}
				</div>

				<div>
					<button
						type="button"
						onClick={() => setShowReactions(!showReactions)}
						className="w-full rounded-lg border border-purple-500/30 bg-purple-500/5 px-3 py-2 font-mono text-[10px] font-bold uppercase tracking-widest text-purple-300 transition-colors hover:bg-purple-500/10"
					>
						{showReactions ? "Hide" : "Show"} Chemical Reactions
					</button>
					{showReactions && (
						<div className="mt-2 space-y-1">
							{REACTIONS.map((r, i) => (
								<div
									key={i}
									className="flex items-center gap-2 rounded border border-white/5 bg-white/[0.02] px-3 py-2"
								>
									<span
										className="font-mono text-[11px] font-bold"
										style={{ color: r.color }}
									>
										{r.from}
									</span>
									<span className="text-zinc-600">{r.arrow}</span>
									<span
										className="font-mono text-[11px] font-bold"
										style={{ color: r.color }}
									>
										{r.to}
									</span>
									<span className="ml-2 font-mono text-[10px] font-bold text-white">
										{r.product}
									</span>
								</div>
							))}
						</div>
					)}
				</div>
			</div>
		</Modal>
	);
}
