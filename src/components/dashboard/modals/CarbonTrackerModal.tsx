import { useState } from "react";
import { Modal } from "#/components/ui/Modal";

const BREAKDOWN = [
	{ name: "Transport", value: 1.9, color: "#38bdf8", icon: "🚗" },
	{ name: "Energy", value: 1.4, color: "#f97316", icon: "⚡" },
	{ name: "Food", value: 0.8, color: "#22c55e", icon: "🍽️" },
	{ name: "Goods", value: 0.5, color: "#a78bfa", icon: "📦" },
	{ name: "Services", value: 0.2, color: "#ec4899", icon: "🏢" },
];

const MONTHLY = [4.2, 4.8, 5.1, 4.9, 4.6, 4.3, 4.8, 5.0, 4.7, 4.5, 4.9, 4.8];
const OFFSETS = [
	{ name: "Planted 10 Trees", points: 50, date: "Mar 10" },
	{ name: "Used Public Transit", points: 20, date: "Mar 12" },
	{ name: "Meat-free Week", points: 100, date: "Mar 8" },
];

export function CarbonTrackerModal() {
	const [offsetLog, setOffsetLog] = useState(OFFSETS);
	const totalFootprint = BREAKDOWN.reduce((s, b) => s + b.value, 0);
	const cityTarget = 2.0;
	const parisTarget = 1.5;

	return (
		<Modal
			id="carbonTracker"
			title="Carbon Tracker"
			icon={<span>🌿</span>}
			accentColor="#84cc16"
			size="lg"
		>
			<div className="space-y-4">
				<div className="grid grid-cols-3 gap-2">
					<div className="rounded-lg border border-white/5 bg-white/[0.03] p-3 text-center">
						<p className="font-mono text-[8px] uppercase tracking-widest text-zinc-500">
							Your Footprint
						</p>
						<p className="font-mono text-2xl font-black text-white">
							{totalFootprint.toFixed(1)}
							<span className="text-xs text-zinc-500">t CO₂</span>
						</p>
					</div>
					<div className="rounded-lg border border-white/5 bg-white/[0.03] p-3 text-center">
						<p className="font-mono text-[8px] uppercase tracking-widest text-zinc-500">
							Bokaro City
						</p>
						<p className="font-mono text-2xl font-black text-orange-400">
							8.2<span className="text-xs text-zinc-500">t CO₂</span>
						</p>
					</div>
					<div className="rounded-lg border border-lime-500/20 bg-lime-500/5 p-3 text-center">
						<p className="font-mono text-[8px] uppercase tracking-widest text-lime-400/60">
							Green Points
						</p>
						<p className="font-mono text-2xl font-black text-lime-400">170</p>
					</div>
				</div>

				<div className="space-y-1.5">
					<p className="font-mono text-[9px] uppercase tracking-widest text-zinc-500">
						Footprint Breakdown
					</p>
					<div className="flex items-center gap-3">
						<svg viewBox="0 0 80 80" className="h-20 w-20 shrink-0">
							<circle
								cx="40"
								cy="40"
								r="35"
								fill="none"
								stroke="#27272a"
								strokeWidth="8"
							/>
							{
								BREAKDOWN.reduce(
									(acc, b, i) => {
										const start = acc;
										const dash = (b.value / totalFootprint) * 219.9;
										acc.elements.push(
											<circle
												key={b.name}
												cx="40"
												cy="40"
												r="35"
												fill="none"
												stroke={b.color}
												strokeWidth="8"
												strokeDasharray={`${dash} ${219.9 - dash}`}
												strokeDashoffset={-start}
												transform="rotate(-90 40 40)"
											/>,
										);
										acc.start += dash;
										return acc;
									},
									{ elements: [] as React.ReactNode[], start: 0 },
								).elements
							}
						</svg>
						<div className="flex-1 space-y-1">
							{BREAKDOWN.map((b) => (
								<div key={b.name} className="flex items-center gap-2">
									<div
										className="h-2 w-2 rounded-full"
										style={{ backgroundColor: b.color }}
									/>
									<span className="font-mono text-[10px] text-zinc-400">
										{b.name}
									</span>
									<span className="ml-auto font-mono text-[10px] font-bold text-white">
										{b.value}t
									</span>
								</div>
							))}
						</div>
					</div>
				</div>

				<div className="space-y-1">
					<p className="font-mono text-[9px] uppercase tracking-widest text-zinc-500">
						Monthly Trend
					</p>
					<svg viewBox="0 0 300 60" className="w-full">
						<line
							x1="0"
							y1={60 - (cityTarget / 6) * 60}
							x2="300"
							y2={60 - (cityTarget / 6) * 60}
							stroke="#f97316"
							strokeWidth="1"
							strokeDasharray="4 2"
						/>
						<line
							x1="0"
							y1={60 - (parisTarget / 6) * 60}
							x2="300"
							y2={60 - (parisTarget / 6) * 60}
							stroke="#22c55e"
							strokeWidth="1"
							strokeDasharray="4 2"
						/>
						<path
							d={
								"M0," +
								(60 - (MONTHLY[0] / 6) * 60) +
								MONTHLY.map(
									(v, i) => `L${i * (300 / 11)},${60 - (v / 6) * 60}`,
								).join(" ")
							}
							fill="none"
							stroke="#84cc16"
							strokeWidth="2"
						/>
					</svg>
					<div className="flex justify-between font-mono text-[8px] text-zinc-600">
						<span>Orange: City Target</span>
						<span>Green: Paris Agreement</span>
					</div>
				</div>

				<div className="space-y-1">
					<p className="font-mono text-[9px] uppercase tracking-widest text-lime-400">
						Offset Actions
					</p>
					<div className="space-y-0.5">
						{offsetLog.map((o, i) => (
							<div
								key={i}
								className="flex items-center gap-2 rounded border border-white/5 bg-white/[0.02] px-3 py-1.5"
							>
								<span className="font-mono text-[10px] text-white">
									{o.name}
								</span>
								<span className="ml-auto rounded bg-lime-500/20 px-2 py-0.5 font-mono text-[9px] font-bold text-lime-300">
									+{o.points}
								</span>
								<span className="font-mono text-[9px] text-zinc-600">
									{o.date}
								</span>
							</div>
						))}
					</div>
				</div>
			</div>
		</Modal>
	);
}
