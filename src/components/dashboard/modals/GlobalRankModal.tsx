import { Modal } from "#/components/ui/Modal";

const CITIES = [
	{
		rank: 1,
		name: "Reykjavik",
		country: "Iceland",
		aqi: 8,
		population: "366K",
	},
	{ rank: 2, name: "Tallinn", country: "Estonia", aqi: 12, population: "437K" },
	{
		rank: 3,
		name: "Zurich",
		country: "Switzerland",
		aqi: 15,
		population: "1.87M",
	},
	{
		rank: 4,
		name: "Sydney",
		country: "Australia",
		aqi: 18,
		population: "5.3M",
	},
	{
		rank: 5,
		name: "Stockholm",
		country: "Sweden",
		aqi: 22,
		population: "1.65M",
	},
	{
		rank: 6,
		name: "Wellington",
		country: "New Zealand",
		aqi: 25,
		population: "412K",
	},
	{
		rank: 7,
		name: "Vancouver",
		country: "Canada",
		aqi: 28,
		population: "2.6M",
	},
	{ rank: 8, name: "London", country: "UK", aqi: 42, population: "9.5M" },
	{
		rank: 9,
		name: "Singapore",
		country: "Singapore",
		aqi: 48,
		population: "5.9M",
	},
	{
		rank: 10,
		name: "San Francisco",
		country: "USA",
		aqi: 52,
		population: "873K",
	},
	{ rank: 11, name: "Beijing", country: "China", aqi: 98, population: "21.9M" },
	{ rank: 12, name: "Delhi", country: "India", aqi: 156, population: "33.8M" },
	{
		rank: 13,
		name: "Lahore",
		country: "Pakistan",
		aqi: 178,
		population: "13.5M",
	},
	{
		rank: 14,
		name: "Dhaka",
		country: "Bangladesh",
		aqi: 192,
		population: "22M",
	},
	{ rank: 15, name: "Bokaro", country: "India", aqi: 144, population: "580K" },
];

function aqiColor(aqi: number) {
	if (aqi <= 50) return "#22c55e";
	if (aqi <= 100) return "#eab308";
	if (aqi <= 150) return "#f97316";
	if (aqi <= 200) return "#dc2626";
	return "#7c3aed";
}

function aqiLabel(aqi: number) {
	if (aqi <= 50) return "Good";
	if (aqi <= 100) return "Moderate";
	if (aqi <= 150) return "Unhealthy(Sensitive)";
	if (aqi <= 200) return "Unhealthy";
	return "Hazardous";
}

export function GlobalRankModal() {
	return (
		<Modal
			id="globalRank"
			title="Global City Rankings"
			icon={<span>🌍</span>}
			accentColor="#22c55e"
			size="lg"
		>
			<div className="space-y-3">
				<div className="grid grid-cols-4 gap-2">
					{["#22c55e", "#eab308", "#f97316", "#dc2626"].map((color, i) => (
						<div
							key={i}
							className="rounded-lg border border-white/5 bg-white/[0.03] p-2 text-center"
						>
							<div
								className="h-1.5 w-full rounded-full"
								style={{ backgroundColor: color }}
							/>
							<p className="mt-1 font-mono text-[9px] text-zinc-500">
								{i === 0
									? "Good"
									: i === 1
										? "Moderate"
										: i === 2
											? "Sensitive"
											: "Poor"}
							</p>
						</div>
					))}
				</div>

				<div className="rounded-lg border border-yellow-500/20 bg-yellow-500/5 p-3">
					<div className="flex items-center justify-between">
						<div>
							<p className="font-mono text-[9px] uppercase tracking-widest text-yellow-400">
								Your City: Bokaro
							</p>
							<p
								className="font-mono text-lg font-black"
								style={{ color: aqiColor(144) }}
							>
								144
							</p>
						</div>
						<div className="text-right">
							<p className="font-mono text-[9px] uppercase text-zinc-500">
								Rank
							</p>
							<p className="font-mono text-lg font-black text-yellow-400">
								#15
							</p>
						</div>
						<div className="text-right">
							<p className="font-mono text-[9px] uppercase text-zinc-500">
								vs Lahore
							</p>
							<p className="font-mono text-lg font-black text-emerald-400">
								↑ 19%
							</p>
						</div>
					</div>
					<div className="mt-2 h-1.5 w-full overflow-hidden rounded-full bg-white/5">
						<div
							className="h-full rounded-full bg-gradient-to-r from-emerald-500 to-yellow-500"
							style={{ width: "45%" }}
						/>
					</div>
					<p className="mt-1 font-mono text-[9px] text-zinc-500">
						World Avg: 78 | WHO Target: &lt;15
					</p>
				</div>

				<div className="space-y-1">
					{CITIES.map((city) => {
						const barPct = Math.min(100, Math.round((city.aqi / 200) * 100));
						return (
							<div
								key={city.rank}
								className={`flex items-center gap-2 rounded-lg border px-3 py-2 transition-colors ${
									city.name === "Bokaro"
										? "border-yellow-500/40 bg-yellow-500/5"
										: city.name === "Lahore"
											? "border-red-500/20"
											: city.name === "London"
												? "border-white/5"
												: "border-white/5"
								}`}
							>
								<span className="w-5 font-mono text-[10px] font-bold text-zinc-600">
									#{city.rank}
								</span>
								<div className="min-w-0 flex-1">
									<p
										className={`font-mono text-[11px] font-bold truncate ${
											city.name === "Bokaro"
												? "text-yellow-400"
												: city.aqi > 150
													? "text-red-400"
													: city.aqi > 50
														? "text-yellow-400"
														: "text-emerald-400"
										}`}
									>
										{city.name}
									</p>
								</div>
								<span className="font-mono text-[9px] text-zinc-600">
									{city.country}
								</span>
								<div className="h-1.5 w-20 overflow-hidden rounded-full bg-white/5">
									<div
										className="h-full rounded-full"
										style={{
											width: `${barPct}%`,
											backgroundColor: aqiColor(city.aqi),
										}}
									/>
								</div>
								<span
									className="w-8 text-right font-mono text-[11px] font-black"
									style={{ color: aqiColor(city.aqi) }}
								>
									{city.aqi}
								</span>
							</div>
						);
					})}
				</div>

				<div className="grid grid-cols-2 gap-2">
					<div className="rounded-lg border border-white/5 bg-white/[0.03] p-2 text-center">
						<p className="font-mono text-[8px] uppercase tracking-widest text-zinc-500">
							Continental Avg
						</p>
						<p className="font-mono text-[10px] font-bold text-emerald-400">
							Asia: 98
						</p>
					</div>
					<div className="rounded-lg border border-white/5 bg-white/[0.03] p-2 text-center">
						<p className="font-mono text-[8px] uppercase tracking-widest text-zinc-500">
							WHO Guideline
						</p>
						<p className="font-mono text-[10px] font-bold text-emerald-400">
							&lt;15 AQI
						</p>
					</div>
				</div>
			</div>
		</Modal>
	);
}
