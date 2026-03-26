import { useState } from "react";
import { Modal } from "#/components/ui/Modal";

const MILESTONES = [
	{ year: 2015, aqi: 198, event: "Diwali firecrackers" },
	{ year: 2017, aqi: 224, event: "Crop burning crisis" },
	{ year: 2019, aqi: 248, event: "Peak industrial boom" },
	{ year: 2020, aqi: 98, event: "COVID lockdown" },
	{ year: 2022, aqi: 182, event: "Post-lockdown surge" },
	{ year: 2024, aqi: 156, event: "Steel plant expansion" },
	{ year: 2026, aqi: 144, event: "Current" },
];

const FUTURE = [
	{ year: 2030, aqi: 118, label: "Policy Impact" },
	{ year: 2040, aqi: 82, label: "Green Transition" },
	{ year: 2050, aqi: 48, label: "Net Zero" },
];

function aqiColor(aqi: number) {
	if (aqi <= 50) return "#22c55e";
	if (aqi <= 100) return "#eab308";
	if (aqi <= 150) return "#f97316";
	if (aqi <= 200) return "#dc2626";
	return "#7c3aed";
}

function skyGradient(aqi: number) {
	if (aqi <= 50) return "from-sky-400 via-emerald-300 to-sky-200";
	if (aqi <= 100) return "from-blue-300 via-yellow-200 to-orange-200";
	if (aqi <= 150) return "from-orange-400 via-yellow-300 to-gray-300";
	if (aqi <= 200) return "from-gray-500 via-orange-400 to-red-300";
	return "from-gray-800 via-red-600 to-purple-900";
}

export function TimeMachineModal() {
	const [year, setYear] = useState(2026);
	const [showFuture, setShowFuture] = useState(false);

	const pastData = MILESTONES;
	const current =
		pastData.find((m) => m.year === year) || pastData[pastData.length - 1];

	return (
		<Modal
			id="timeMachine"
			title="Time Machine"
			icon={<span>⏳</span>}
			accentColor="#a78bfa"
			size="lg"
		>
			<div className="space-y-4">
				<div
					className={`relative h-28 w-full overflow-hidden rounded-xl bg-gradient-to-b ${skyGradient(current.aqi)}`}
				>
					<svg viewBox="0 0 320 80" className="absolute inset-0 h-full w-full">
						<circle cx="260" cy="20" r="15" fill="#fbbf24" fillOpacity="0.8" />
						{[...Array(30)].map((_, i) => (
							<circle
								key={i}
								cx={i * 12 + Math.random() * 8}
								cy={5 + Math.random() * 25}
								r={0.5 + Math.random() * 0.5}
								fill="white"
								fillOpacity={current.aqi <= 100 ? 0.8 : 0.2}
							/>
						))}
					</svg>
					<div className="absolute inset-0 flex items-center justify-center">
						<p className="font-mono text-4xl font-black text-white drop-shadow-lg">
							{current.year}
						</p>
					</div>
					<div className="absolute bottom-1 left-2 right-2 flex justify-between">
						<span className="rounded bg-black/30 px-2 py-0.5 font-mono text-[9px] text-white">
							{current.event}
						</span>
						<span className="rounded bg-black/30 px-2 py-0.5 font-mono text-[10px] font-black text-white">
							AQI: {current.aqi}
						</span>
					</div>
				</div>

				<div>
					<div className="mb-2 flex items-center justify-between">
						<p className="font-mono text-[9px] uppercase tracking-widest text-zinc-500">
							2015 → 2026
						</p>
						<span className="font-mono text-[10px] font-bold text-white">
							{year}
						</span>
					</div>
					<input
						type="range"
						min="2015"
						max="2026"
						value={year}
						onChange={(e) => setYear(Number(e.target.value))}
						className="h-2 w-full cursor-pointer appearance-none rounded-full accent-purple-500"
					/>
				</div>

				<div className="space-y-1">
					<p className="font-mono text-[9px] uppercase tracking-widest text-zinc-500">
						AQI History
					</p>
					<svg viewBox="0 0 300 60" className="w-full">
						<defs>
							<linearGradient id="lineGrad" x1="0" y1="0" x2="1" y2="0">
								{pastData.map((m, i) => (
									<stop
										key={m.year}
										offset={`${(i / (pastData.length - 1)) * 100}%`}
										stopColor={aqiColor(m.aqi)}
									/>
								))}
							</linearGradient>
						</defs>

						{pastData.map((m, i) => {
							const x = (i / (pastData.length - 1)) * 300;
							const y = 60 - (m.aqi / 250) * 55;
							const next = pastData[i + 1];
							if (!next) return null;
							const nx = ((i + 1) / (pastData.length - 1)) * 300;
							const ny = 60 - (next.aqi / 250) * 55;
							return (
								<g key={m.year}>
									<line
										x1={x}
										y1={y}
										x2={nx}
										y2={ny}
										stroke={aqiColor(m.aqi)}
										strokeWidth="2"
									/>
									<circle cx={x} cy={y} r={3} fill={aqiColor(m.aqi)} />
								</g>
							);
						})}
					</svg>
				</div>

				<div className="space-y-1">
					<div className="mb-1 flex items-center justify-between">
						<p className="font-mono text-[9px] uppercase tracking-widest text-zinc-500">
							Milestones
						</p>
						<button
							type="button"
							onClick={() => setShowFuture(!showFuture)}
							className={`rounded border px-2 py-0.5 font-mono text-[9px] font-bold transition-colors ${
								showFuture
									? "border-purple-500/40 bg-purple-500/10 text-purple-300"
									: "border-white/10 bg-white/[0.02] text-zinc-500"
							}`}
						>
							{showFuture ? "Hide" : "Show"} Future
						</button>
					</div>
					<div className="grid grid-cols-2 gap-1">
						{pastData.map((m) => (
							<button
								key={m.year}
								type="button"
								onClick={() => setYear(m.year)}
								className={`flex items-center gap-2 rounded border px-2 py-1.5 font-mono text-[10px] transition-colors ${
									year === m.year
										? "border-purple-500/40 bg-purple-500/10 text-purple-300"
										: "border-white/5 bg-white/[0.02] text-zinc-400 hover:border-white/10"
								}`}
							>
								<span className="font-bold">{m.year}</span>
								<span className="truncate text-[9px] text-zinc-600">
									{m.event}
								</span>
							</button>
						))}
					</div>

					{showFuture && (
						<div className="mt-2 grid grid-cols-3 gap-1">
							{FUTURE.map((f) => (
								<div
									key={f.year}
									className="rounded-lg border border-dashed border-emerald-500/30 bg-emerald-500/5 p-2 text-center"
								>
									<p className="font-mono text-[8px] text-emerald-400">
										{f.label}
									</p>
									<p className="font-mono text-lg font-black text-emerald-300">
										{f.year}
									</p>
									<p
										className="font-mono text-[10px] font-bold"
										style={{ color: aqiColor(f.aqi) }}
									>
										AQI {f.aqi}
									</p>
								</div>
							))}
						</div>
					)}
				</div>
			</div>
		</Modal>
	);
}
