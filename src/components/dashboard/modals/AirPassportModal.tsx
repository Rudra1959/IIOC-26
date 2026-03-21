import { useState } from "react";
import { Modal } from "#/components/ui/Modal";

const INDIA_CITIES: Record<string, { aqi: number; lat: number; lng: number }> =
	{
		"New Delhi": { aqi: 156, lat: 28.61, lng: 77.21 },
		"Bokaro Steel City": { aqi: 144, lat: 23.67, lng: 86.15 },
		Mumbai: { aqi: 78, lat: 19.08, lng: 72.88 },
		Kolkata: { aqi: 112, lat: 22.57, lng: 88.36 },
		Bengaluru: { aqi: 62, lat: 12.97, lng: 77.59 },
		Chennai: { aqi: 68, lat: 13.08, lng: 80.27 },
		Hyderabad: { aqi: 74, lat: 17.38, lng: 78.48 },
		Pune: { aqi: 82, lat: 18.52, lng: 73.86 },
		Jaipur: { aqi: 128, lat: 26.91, lng: 75.79 },
		Lucknow: { aqi: 145, lat: 26.85, lng: 80.95 },
		Ahmedabad: { aqi: 95, lat: 23.03, lng: 72.58 },
		Kochi: { aqi: 45, lat: 9.93, lng: 76.26 },
		Goa: { aqi: 38, lat: 15.5, lng: 73.83 },
		Ludhiana: { aqi: 168, lat: 30.9, lng: 75.85 },
		Patna: { aqi: 182, lat: 25.59, lng: 85.14 },
	};

const CLEANEST = [
	{ name: "Goa", aqi: 38, country: "India" },
	{ name: "Kochi", aqi: 45, country: "India" },
	{ name: "Bengaluru", aqi: 62, country: "India" },
	{ name: "Chennai", aqi: 68, country: "India" },
	{ name: "Mumbai", aqi: 78, country: "India" },
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
	if (aqi <= 150) return "Unhealthy";
	return "Hazardous";
}

export function AirPassportModal() {
	const [selectedCity, setSelectedCity] = useState<string | null>(null);
	const [trips, setTrips] = useState<
		{ city: string; aqi: number; date: string }[]
	>([
		{ city: "Goa", aqi: 38, date: "Mar 15, 2026" },
		{ city: "Bengaluru", aqi: 62, date: "Feb 28, 2026" },
	]);

	const selected = selectedCity ? INDIA_CITIES[selectedCity] : null;

	return (
		<Modal
			id="airPassport"
			title="Air Passport"
			icon={<span>✈️</span>}
			accentColor="#38bdf8"
			size="lg"
		>
			<div className="space-y-4">
				<div className="relative">
					<svg
						viewBox="0 0 300 220"
						className="w-full rounded-xl border border-white/10 bg-[#0a1628]"
					>
						<text x="5" y="15" className="fill-zinc-500 text-[8px]">
							INDIA AQI MAP
						</text>

						{Object.entries(INDIA_CITIES).map(([name, data]) => {
							const x = ((data.lng - 68) / 25) * 260 + 20;
							const y = ((37 - data.lat) / 17) * 180 + 15;
							const r = Math.max(4, Math.min(10, data.aqi / 20));
							return (
								<g
									key={name}
									onClick={() => setSelectedCity(name)}
									className="cursor-pointer"
								>
									<circle
										cx={x}
										cy={y}
										r={r}
										fill={aqiColor(data.aqi)}
										fillOpacity="0.7"
										className="transition-all hover:fill-opacity-100"
									/>
									<circle
										cx={x}
										cy={y}
										r={r + 2}
										fill="none"
										stroke={aqiColor(data.aqi)}
										strokeOpacity="0.3"
										strokeWidth="1"
									/>
								</g>
							);
						})}

						<text x="5" y="210" className="fill-zinc-600 text-[7px]">
							◀ Green=Good | Yellow=Moderate | Orange=Unhealthy | Red=Hazardous
							▶
						</text>
					</svg>
				</div>

				{selected && (
					<div
						className="rounded-xl border-2 bg-white/[0.03] p-4"
						style={{ borderColor: `${aqiColor(selected.aqi)}40` }}
					>
						<div className="flex items-center justify-between">
							<div>
								<p className="font-mono text-sm font-bold text-white">
									{selectedCity}
								</p>
								<p className="font-mono text-[10px] text-zinc-500">
									{aqiLabel(selected.aqi)}
								</p>
							</div>
							<div className="text-right">
								<p
									className="font-mono text-3xl font-black"
									style={{ color: aqiColor(selected.aqi) }}
								>
									{selected.aqi}
								</p>
								<p className="font-mono text-[9px] text-zinc-500">AQI</p>
							</div>
						</div>
						<div className="mt-3 grid grid-cols-3 gap-2">
							<div className="rounded bg-black/40 p-2 text-center">
								<p className="font-mono text-[8px] text-zinc-500">PM2.5</p>
								<p
									className="font-mono text-[11px] font-bold"
									style={{ color: aqiColor(selected.aqi) }}
								>
									{Math.round(selected.aqi * 0.6)}
								</p>
							</div>
							<div className="rounded bg-black/40 p-2 text-center">
								<p className="font-mono text-[8px] text-zinc-500">NO₂</p>
								<p
									className="font-mono text-[11px] font-bold"
									style={{ color: aqiColor(selected.aqi) }}
								>
									{Math.round(selected.aqi * 0.3)}
								</p>
							</div>
							<div className="rounded bg-black/40 p-2 text-center">
								<p className="font-mono text-[8px] text-zinc-500">O₃</p>
								<p
									className="font-mono text-[11px] font-bold"
									style={{ color: aqiColor(selected.aqi) }}
								>
									{Math.round(selected.aqi * 0.2)}
								</p>
							</div>
						</div>
					</div>
				)}

				<div>
					<p className="mb-2 font-mono text-[9px] uppercase tracking-widest text-zinc-500">
						Search City
					</p>
					<div className="grid grid-cols-3 gap-1">
						{Object.keys(INDIA_CITIES).map((city) => (
							<button
								key={city}
								type="button"
								onClick={() => setSelectedCity(city)}
								className={`rounded border px-2 py-1 font-mono text-[9px] font-bold transition-colors ${
									selectedCity === city
										? "border-sky-500/50 bg-sky-500/10 text-sky-300"
										: "border-white/5 bg-white/[0.02] text-zinc-400 hover:border-white/10"
								}`}
							>
								{city}
							</button>
						))}
					</div>
				</div>

				<div>
					<p className="mb-2 font-mono text-[9px] uppercase tracking-widest text-emerald-400">
						🌿 Cleanest Destinations
					</p>
					<div className="space-y-1">
						{CLEANEST.map((c, i) => (
							<div
								key={c.name}
								className="flex items-center gap-2 rounded border border-white/5 bg-white/[0.02] px-3 py-1.5"
							>
								<span className="font-mono text-[10px] font-bold text-zinc-600">
									#{i + 1}
								</span>
								<span className="font-mono text-[11px] text-white">
									{c.name}
								</span>
								<span
									className="ml-auto font-mono text-[10px] font-black"
									style={{ color: aqiColor(c.aqi) }}
								>
									{c.aqi}
								</span>
								<span className="font-mono text-[9px] text-emerald-400">
									AQI
								</span>
							</div>
						))}
					</div>
				</div>

				<div>
					<p className="mb-2 font-mono text-[9px] uppercase tracking-widest text-zinc-500">
						✈️ Recent Trips
					</p>
					<div className="space-y-1">
						{trips.map((trip) => (
							<div
								key={trip.city + trip.date}
								className="flex items-center gap-2 rounded border border-white/5 bg-white/[0.02] px-3 py-1.5"
							>
								<span className="font-mono text-[11px] text-white">
									{trip.city}
								</span>
								<span className="ml-auto font-mono text-[10px] font-bold text-zinc-500">
									{trip.date}
								</span>
							</div>
						))}
					</div>
				</div>
			</div>
		</Modal>
	);
}
