import { useState } from "react";
import { Modal } from "#/components/ui/Modal";

const CITIES = [
	{
		name: "Delhi",
		country: "India",
		aqi: 156,
		pm25: 94,
		no2: 42,
		o3: 38,
		co: 1.2,
		population: "33.8M",
	},
	{
		name: "London",
		country: "UK",
		aqi: 42,
		pm25: 12,
		no2: 18,
		o3: 22,
		co: 0.3,
		population: "9.5M",
	},
	{
		name: "Bengaluru",
		country: "India",
		aqi: 62,
		pm25: 28,
		no2: 15,
		o3: 18,
		co: 0.5,
		population: "13.4M",
	},
	{
		name: "Bokaro",
		country: "India",
		aqi: 144,
		pm25: 86,
		no2: 38,
		o3: 32,
		co: 1.1,
		population: "580K",
	},
	{
		name: "Shanghai",
		country: "China",
		aqi: 88,
		pm25: 48,
		no2: 32,
		o3: 28,
		co: 0.7,
		population: "24.9M",
	},
	{
		name: "Mumbai",
		country: "India",
		aqi: 78,
		pm25: 36,
		no2: 22,
		o3: 24,
		co: 0.6,
		population: "21.3M",
	},
	{
		name: "Lahore",
		country: "Pakistan",
		aqi: 178,
		pm25: 108,
		no2: 48,
		o3: 42,
		co: 1.4,
		population: "13.5M",
	},
	{
		name: "Singapore",
		country: "Singapore",
		aqi: 48,
		pm25: 14,
		no2: 12,
		o3: 16,
		co: 0.25,
		population: "5.9M",
	},
	{
		name: "Paris",
		country: "France",
		aqi: 52,
		pm25: 16,
		no2: 20,
		o3: 24,
		co: 0.35,
		population: "2.1M",
	},
	{
		name: "Dhaka",
		country: "Bangladesh",
		aqi: 192,
		pm25: 116,
		no2: 52,
		o3: 45,
		co: 1.6,
		population: "22M",
	},
	{
		name: "Berlin",
		country: "Germany",
		aqi: 38,
		pm25: 10,
		no2: 14,
		o3: 18,
		co: 0.28,
		population: "3.7M",
	},
	{
		name: "Dubai",
		country: "UAE",
		aqi: 85,
		pm25: 38,
		no2: 28,
		o3: 26,
		co: 0.55,
		population: "3.6M",
	},
];

function aqiColor(aqi: number) {
	if (aqi <= 50) return "#22c55e";
	if (aqi <= 100) return "#eab308";
	if (aqi <= 150) return "#f97316";
	if (aqi <= 200) return "#dc2626";
	return "#7c3aed";
}

export function CityAirDuelModal() {
	const [left, setLeft] = useState<(typeof CITIES)[0] | null>(CITIES[0]);
	const [right, setRight] = useState<(typeof CITIES)[0] | null>(CITIES[3]);

	const winner = left && right ? (left.aqi <= right.aqi ? left : right) : null;
	const loser =
		left && right && winner ? (left === winner ? right : left) : null;

	return (
		<Modal
			id="cityDuel"
			title="City Air Duel"
			icon={<span>⚔️</span>}
			accentColor="#f97316"
			size="lg"
		>
			<div className="space-y-4">
				<div className="flex gap-2">
					<div className="flex-1 space-y-1">
						<p className="font-mono text-[9px] uppercase tracking-widest text-zinc-500">
							Challenger
						</p>
						<div className="grid grid-cols-2 gap-1">
							{CITIES.slice(0, 6).map((city) => (
								<button
									key={city.name}
									type="button"
									onClick={() => setLeft(city)}
									className={`rounded border px-2 py-1.5 font-mono text-[10px] font-bold transition-colors ${
										left?.name === city.name
											? "border-orange-500/50 bg-orange-500/10 text-orange-300"
											: "border-white/5 bg-white/[0.02] text-zinc-400 hover:border-white/10"
									}`}
								>
									{city.name}
								</button>
							))}
						</div>
					</div>
					<div className="flex-1 space-y-1">
						<p className="font-mono text-[9px] uppercase tracking-widest text-zinc-500">
							Opponent
						</p>
						<div className="grid grid-cols-2 gap-1">
							{CITIES.slice(6).map((city) => (
								<button
									key={city.name}
									type="button"
									onClick={() => setRight(city)}
									className={`rounded border px-2 py-1.5 font-mono text-[10px] font-bold transition-colors ${
										right?.name === city.name
											? "border-sky-500/50 bg-sky-500/10 text-sky-300"
											: "border-white/5 bg-white/[0.02] text-zinc-400 hover:border-white/10"
									}`}
								>
									{city.name}
								</button>
							))}
						</div>
					</div>
				</div>

				{left && right && (
					<>
						<div className="relative flex items-center justify-between gap-4 rounded-2xl border border-white/10 bg-white/[0.02] p-4">
							<div className="flex-1 text-center">
								<p
									className="font-mono text-lg font-black"
									style={{ color: aqiColor(left.aqi) }}
								>
									{left.aqi}
								</p>
								<p className="font-mono text-[10px] text-zinc-400">
									{left.name}
								</p>
								<p className="font-mono text-[9px] text-zinc-600">
									{left.country}
								</p>
								{winner?.name === left.name && (
									<span className="mt-1 inline-block rounded bg-emerald-500/20 px-2 py-0.5 font-mono text-[9px] font-bold text-emerald-400">
										WINNER
									</span>
								)}
							</div>

							<div className="flex flex-col items-center gap-1">
								<span className="font-mono text-[9px] uppercase tracking-widest text-zinc-600">
									VS
								</span>
								<div className="h-12 w-px bg-gradient-to-b from-orange-500 via-white/20 to-sky-500" />
								<span className="font-mono text-[8px] text-zinc-600">AQI</span>
							</div>

							<div className="flex-1 text-center">
								<p
									className="font-mono text-lg font-black"
									style={{ color: aqiColor(right.aqi) }}
								>
									{right.aqi}
								</p>
								<p className="font-mono text-[10px] text-zinc-400">
									{right.name}
								</p>
								<p className="font-mono text-[9px] text-zinc-600">
									{right.country}
								</p>
								{winner?.name === right.name && (
									<span className="mt-1 inline-block rounded bg-emerald-500/20 px-2 py-0.5 font-mono text-[9px] font-bold text-emerald-400">
										WINNER
									</span>
								)}
							</div>
						</div>

						{winner && loser && (
							<div className="space-y-1">
								<p className="font-mono text-[9px] uppercase tracking-widest text-zinc-500">
									Stat Breakdown
								</p>
								{[
									{
										label: "PM2.5",
										winner: winner.pm25 < loser.pm25 ? winner : loser,
										loser: winner.pm25 < loser.pm25 ? loser : winner,
										key: "pm25" as const,
									},
									{
										label: "NO₂",
										winner: winner.no2 < loser.no2 ? winner : loser,
										loser: winner.no2 < loser.no2 ? loser : winner,
										key: "no2" as const,
									},
									{
										label: "O₃",
										winner: winner.o3 < loser.o3 ? winner : loser,
										loser: winner.o3 < loser.o3 ? loser : winner,
										key: "o3" as const,
									},
									{
										label: "CO",
										winner: winner.co < loser.co ? winner : loser,
										loser: winner.co < loser.co ? loser : winner,
										key: "co" as const,
									},
								].map(({ label, winner: w, loser: l, key }) => (
									<div
										key={label}
										className="flex items-center gap-2 rounded border border-white/5 px-3 py-1.5"
									>
										<span className="w-10 font-mono text-[10px] text-zinc-500">
											{label}
										</span>
										<span
											className={`font-mono text-[11px] font-bold ${w.name === left.name ? "text-orange-300" : "text-sky-300"}`}
										>
											{w.name}: {w[key]}
										</span>
										<span className="mx-auto text-zinc-600">vs</span>
										<span
											className={`font-mono text-[11px] font-bold ${l.name === left.name ? "text-orange-300" : "text-sky-300"}`}
										>
											{l.name}: {l[key]}
										</span>
									</div>
								))}
							</div>
						)}

						<div className="rounded-xl border border-emerald-500/20 bg-emerald-500/5 p-3 text-center">
							<p className="font-mono text-[10px] uppercase tracking-widest text-emerald-400">
								Verdict
							</p>
							<p className="font-mono text-sm font-bold text-emerald-300">
								{winner?.name} is{" "}
								{Math.round(Math.abs(winner!.aqi - loser!.aqi))} AQI points
								cleaner than {loser?.name}
							</p>
						</div>
					</>
				)}
			</div>
		</Modal>
	);
}
