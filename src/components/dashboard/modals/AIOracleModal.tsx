import { useState } from "react";
import { Modal } from "#/components/ui/Modal";

const FORECAST = [
	{ day: "Today", aqi: 144, min: 128, max: 162, confidence: 92 },
	{ day: "Tue", aqi: 138, min: 118, max: 158, confidence: 88 },
	{ day: "Wed", aqi: 125, min: 102, max: 148, confidence: 85 },
	{ day: "Thu", aqi: 118, min: 95, max: 142, confidence: 82 },
	{ day: "Fri", aqi: 108, min: 85, max: 132, confidence: 78 },
	{ day: "Sat", aqi: 98, min: 72, max: 125, confidence: 75 },
	{ day: "Sun", aqi: 88, min: 62, max: 115, confidence: 72 },
];

const DRIVERS = [
	{ label: "Met Data", pct: 38, color: "#38bdf8" },
	{ label: "Historical", pct: 28, color: "#22c55e" },
	{ label: "Satellite", pct: 10, color: "#8b5cf6" },
	{ label: "Wind", pct: 14, color: "#f97316" },
	{ label: "Traffic", pct: 10, color: "#ec4899" },
];

export function AIOracleModal() {
	return (
		<Modal
			id="aiOracle"
			title="AI Oracle"
			icon={<span>🔮</span>}
			accentColor="#c084fc"
			size="lg"
		>
			<div className="space-y-4">
				<div className="space-y-1.5">
					<div className="flex items-center justify-between">
						<p className="font-mono text-[9px] uppercase tracking-widest text-zinc-500">
							7-Day Forecast
						</p>
						<span className="rounded border border-purple-500/30 bg-purple-500/10 px-2 py-0.5 font-mono text-[9px] font-bold text-purple-400">
							Avg: 117 AQI
						</span>
					</div>
					<svg viewBox="0 0 300 100" className="w-full">
						{FORECAST.map((day, i) => {
							const x = i * 42 + 20;
							const midY = 90 - (day.aqi / 180) * 80;
							const maxY = 90 - (day.max / 180) * 80;
							const minY = 90 - (day.min / 180) * 80;
							return (
								<g key={day.day}>
									<line
										x1={x}
										y1={minY}
										x2={x}
										y2={maxY}
										stroke="#c084fc"
										strokeWidth="1"
										strokeOpacity="0.3"
									/>
									<ellipse
										cx={x}
										cy={midY}
										rx="14"
										ry="6"
										fill={day.day === "Today" ? "#c084fc" : "#27272a"}
										fillOpacity={day.day === "Today" ? 0.9 : 0.6}
									/>
									<text
										x={x}
										y="96"
										textAnchor="middle"
										className="fill-zinc-500"
										fontSize="6"
										fontFamily="monospace"
									>
										{day.day}
									</text>
									<text
										x={x}
										y={midY + 3}
										textAnchor="middle"
										className="fill-white"
										fontSize="7"
										fontFamily="monospace"
										fontWeight="bold"
									>
										{day.aqi}
									</text>
								</g>
							);
						})}
					</svg>
				</div>

				<div className="grid grid-cols-7 gap-1">
					{FORECAST.map((day) => (
						<div key={day.day} className="text-center">
							<div className="h-1.5 w-full overflow-hidden rounded-full bg-white/5">
								<div
									className="h-full rounded-full bg-purple-500"
									style={{ width: `${day.confidence}%` }}
								/>
							</div>
							<p className="mt-0.5 font-mono text-[8px] text-purple-400">
								{day.confidence}%
							</p>
						</div>
					))}
				</div>

				<div className="grid grid-cols-2 gap-2">
					<div className="space-y-1 rounded-lg border border-white/5 bg-white/[0.03] p-3">
						<p className="font-mono text-[9px] uppercase tracking-widest text-zinc-500">
							Model Architecture
						</p>
						<div className="space-y-1">
							{DRIVERS.map((d) => (
								<div key={d.label} className="flex items-center gap-2">
									<span className="w-16 font-mono text-[9px] text-zinc-500">
										{d.label}
									</span>
									<div className="h-1.5 flex-1 overflow-hidden rounded-full bg-white/5">
										<div
											className="h-full rounded-full"
											style={{ width: `${d.pct}%`, backgroundColor: d.color }}
										/>
									</div>
									<span
										className="w-8 text-right font-mono text-[9px] font-bold"
										style={{ color: d.color }}
									>
										{d.pct}%
									</span>
								</div>
							))}
						</div>
					</div>

					<div className="space-y-1 rounded-lg border border-white/5 bg-white/[0.03] p-3">
						<p className="font-mono text-[9px] uppercase tracking-widest text-zinc-500">
							Key Forecast Drivers
						</p>
						<div className="space-y-1.5">
							{[
								{
									icon: "🌧️",
									text: "Rain expected Tue–Wed",
									impact: "Good",
									color: "#22c55e",
								},
								{
									icon: "💨",
									text: "Winds NE 12km/h",
									impact: "Neutral",
									color: "#eab308",
								},
								{
									icon: "🏭",
									text: "Plant at 90% capacity",
									impact: "Poor",
									color: "#dc2626",
								},
								{
									icon: "🚗",
									text: "Peak traffic 8–10am",
									impact: "Poor",
									color: "#dc2626",
								},
							].map((item) => (
								<div
									key={item.text}
									className="flex items-center gap-2 rounded border border-white/5 bg-white/[0.02] px-2 py-1.5"
								>
									<span className="text-sm">{item.icon}</span>
									<span className="flex-1 font-mono text-[9px] text-zinc-400">
										{item.text}
									</span>
									<span
										className="font-mono text-[9px] font-bold"
										style={{ color: item.color }}
									>
										{item.impact}
									</span>
								</div>
							))}
						</div>
					</div>
				</div>
			</div>
		</Modal>
	);
}
