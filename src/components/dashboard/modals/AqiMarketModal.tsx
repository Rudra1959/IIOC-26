import { useState } from "react";
import { Modal } from "#/components/ui/Modal";

const BUCKETS = [
	{ label: "0-50", range: "Good", color: "#22c55e", betPct: 8 },
	{ label: "51-100", range: "Moderate", color: "#eab308", betPct: 22 },
	{ label: "101-150", range: "Sensitive", color: "#f97316", betPct: 35 },
	{ label: "151-200", range: "Unhealthy", color: "#dc2626", betPct: 25 },
	{ label: "201+", range: "Hazardous", color: "#7c3aed", betPct: 10 },
];

const HISTORY = [
	{ day: "Mon", guess: 145, actual: 138, correct: true },
	{ day: "Tue", guess: 130, actual: 142, correct: false },
	{ day: "Wed", guess: 155, actual: 158, correct: true },
	{ day: "Thu", guess: 140, actual: 135, correct: false },
	{ day: "Fri", guess: 150, actual: 148, correct: true },
	{ day: "Sat", guess: 142, actual: 144, correct: true },
];

export function AqiMarketModal() {
	const [selected, setSelected] = useState<string | null>(null);
	const [streak, setStreak] = useState(3);
	const accuracy = Math.round(
		(HISTORY.filter((h) => h.correct).length / HISTORY.length) * 100,
	);

	return (
		<Modal
			id="aqiMarket"
			title="AQI Market"
			icon={<span>📈</span>}
			accentColor="#14b8a6"
			size="lg"
		>
			<div className="space-y-4">
				<div className="rounded-xl border border-teal-500/20 bg-teal-500/5 p-4">
					<p className="mb-1 text-center font-mono text-[9px] uppercase tracking-widest text-teal-400">
						Tomorrow's AQI Prediction
					</p>
					<p className="text-center font-mono text-2xl font-black text-teal-300">
						What will the AQI be?
					</p>
				</div>

				<div className="space-y-1.5">
					<p className="font-mono text-[9px] uppercase tracking-widest text-zinc-500">
						Place Your Prediction
					</p>
					<div className="grid grid-cols-5 gap-1">
						{BUCKETS.map((b) => (
							<button
								key={b.label}
								type="button"
								onClick={() => setSelected(b.label)}
								className={`flex flex-col items-center rounded-xl border p-2 transition-all ${
									selected === b.label
										? "border-teal-500/60 bg-teal-500/10"
										: "border-white/5 bg-white/[0.02] hover:border-white/10"
								}`}
							>
								<span
									className="font-mono text-[10px] font-bold"
									style={{ color: selected === b.label ? b.color : "#71717a" }}
								>
									{b.label}
								</span>
								<span className="font-mono text-[8px] text-zinc-600">
									{b.range}
								</span>
								<div className="mt-1 h-1 w-full overflow-hidden rounded-full bg-white/5">
									<div
										className="h-full rounded-full"
										style={{ width: `${b.betPct}%`, backgroundColor: b.color }}
									/>
								</div>
								<span className="mt-0.5 font-mono text-[8px] text-zinc-500">
									{b.betPct}% bet
								</span>
							</button>
						))}
					</div>
				</div>

				<div className="grid grid-cols-3 gap-2">
					<div className="rounded-lg border border-white/5 bg-white/[0.03] p-3 text-center">
						<p className="font-mono text-[8px] uppercase tracking-widest text-zinc-500">
							Your Streak
						</p>
						<p className="font-mono text-xl font-black text-teal-400">
							{streak}🔥
						</p>
					</div>
					<div className="rounded-lg border border-white/5 bg-white/[0.03] p-3 text-center">
						<p className="font-mono text-[8px] uppercase tracking-widest text-zinc-500">
							Accuracy
						</p>
						<p className="font-mono text-xl font-black text-white">
							{accuracy}%
						</p>
					</div>
					<div className="rounded-lg border border-white/5 bg-white/[0.03] p-3 text-center">
						<p className="font-mono text-[8px] uppercase tracking-widest text-zinc-500">
							Bokaro Rank
						</p>
						<p className="font-mono text-xl font-black text-white">#42</p>
					</div>
				</div>

				<div className="space-y-1">
					<p className="font-mono text-[9px] uppercase tracking-widest text-zinc-500">
						Community Consensus
					</p>
					<div className="rounded-lg border border-white/5 bg-white/[0.02] p-3">
						<div className="flex h-4 overflow-hidden rounded-full bg-white/5">
							{BUCKETS.map((b) => (
								<div
									key={b.label}
									className="flex items-center justify-center"
									style={{
										width: `${b.betPct}%`,
										backgroundColor: `${b.color}40`,
									}}
								>
									{b.betPct > 15 && (
										<span className="font-mono text-[7px] text-white">
											{b.betPct}%
										</span>
									)}
								</div>
							))}
						</div>
						<div className="mt-1 flex justify-between font-mono text-[8px] text-zinc-600">
							<span>0</span>
							<span>50</span>
							<span>100</span>
							<span>150</span>
							<span>200+</span>
						</div>
						<p className="mt-2 text-center font-mono text-[9px] text-zinc-500">
							35% say 101-150 (Most Likely)
						</p>
					</div>
				</div>

				<div className="space-y-1">
					<p className="font-mono text-[9px] uppercase tracking-widest text-zinc-500">
						Your Prediction History
					</p>
					<div className="space-y-0.5">
						{HISTORY.map((h, i) => (
							<div
								key={i}
								className="flex items-center gap-2 rounded border border-white/5 bg-white/[0.02] px-3 py-1.5"
							>
								<span className="font-mono text-[10px] text-zinc-500">
									{h.day}
								</span>
								<span
									className="font-mono text-[10px] font-bold"
									style={{ color: h.correct ? "#22c55e" : "#dc2626" }}
								>
									{h.correct ? "✓" : "✗"}
								</span>
								<span className="font-mono text-[10px] text-zinc-400">
									Guess: {h.guess}
								</span>
								<span className="font-mono text-[10px] text-zinc-600">
									Actual: {h.actual}
								</span>
							</div>
						))}
					</div>
				</div>
			</div>
		</Modal>
	);
}
