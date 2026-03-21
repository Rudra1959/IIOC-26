import { useState } from "react";
import { Modal } from "#/components/ui/Modal";

const GHOST_CITIES = [
	{
		id: "green",
		name: "Green Industrial",
		aqi: 42,
		sky: "from-emerald-300 via-sky-300 to-emerald-200",
		desc: "Sustainable industry, clean energy",
	},
	{
		id: "forest",
		name: "Forest City",
		aqi: 18,
		sky: "from-green-300 via-emerald-200 to-teal-200",
		desc: "Urban forests, zero emissions",
	},
	{
		id: "real",
		name: "Real Bokaro",
		aqi: 144,
		sky: "from-gray-400 via-orange-300 to-gray-300",
		desc: "Current industrial reality",
	},
	{
		id: "expansion",
		name: "Heavy Expansion",
		aqi: 232,
		sky: "from-gray-600 via-orange-500 to-red-400",
		desc: "Maximum industrial growth",
	},
	{
		id: "nightmare",
		name: "Nightmare",
		aqi: 310,
		sky: "from-gray-900 via-red-800 to-purple-900",
		desc: "Worst case scenario",
	},
];

export function GhostCitiesModal() {
	const [selected, setSelected] = useState<(typeof GHOST_CITIES)[0]>(
		GHOST_CITIES[2],
	);

	return (
		<Modal
			id="ghostCities"
			title="Ghost Cities"
			icon={<span>👻</span>}
			accentColor="#6b7280"
			size="lg"
		>
			<div className="space-y-4">
				<div
					className={`h-36 w-full overflow-hidden rounded-xl bg-gradient-to-b ${selected.sky}`}
				>
					<svg viewBox="0 0 300 100" className="absolute inset-0 h-full w-full">
						{[...Array(20)].map((_, i) => (
							<circle
								key={i}
								cx={i * 15 + Math.random() * 10}
								cy={5 + Math.random() * 20}
								r={0.5 + Math.random()}
								fill="white"
								fillOpacity={0.6}
							/>
						))}
						<rect x="20" y="60" width="30" height="40" fill="#1f2937" />
						<rect x="60" y="45" width="25" height="55" fill="#374151" />
						<rect x="95" y="50" width="35" height="50" fill="#1f2937" />
						<rect x="140" y="35" width="40" height="65" fill="#4b5563" />
						<rect x="190" y="55" width="28" height="45" fill="#374151" />
						<rect x="228" y="40" width="32" height="60" fill="#1f2937" />
						<rect x="265" y="50" width="25" height="50" fill="#374151" />
					</svg>
					<div className="absolute inset-0 flex flex-col items-center justify-center">
						<p className="font-mono text-3xl font-black text-white drop-shadow-xl">
							{selected.name}
						</p>
						<p className="mt-1 rounded bg-black/40 px-3 py-1 font-mono text-sm font-black text-white">
							{selected.aqi} AQI
						</p>
					</div>
				</div>

				<p className="text-center font-mono text-[10px] text-zinc-400">
					{selected.desc}
				</p>

				<div className="grid grid-cols-5 gap-1.5">
					{GHOST_CITIES.map((city) => (
						<button
							key={city.id}
							type="button"
							onClick={() => setSelected(city)}
							className={`flex flex-col items-center gap-1 rounded-xl border p-2 transition-all ${
								selected.id === city.id
									? "border-white/20 bg-white/10"
									: "border-white/5 bg-white/[0.02] hover:border-white/10"
							}`}
						>
							<div
								className={`h-6 w-full rounded bg-gradient-to-b ${city.sky}`}
							/>
							<p className="font-mono text-[8px] font-bold text-white">
								{city.aqi}
							</p>
							<p className="text-center font-mono text-[7px] text-zinc-600 leading-tight">
								{city.name.split(" ")[0]}
							</p>
						</button>
					))}
				</div>

				<div className="grid grid-cols-5 gap-1">
					{[
						{ label: "PM2.5", real: 86, ghost: selected.aqi * 0.6 },
						{ label: "NO₂", real: 38, ghost: selected.aqi * 0.3 },
						{ label: "SO₂", real: 15, ghost: selected.aqi * 0.15 },
						{ label: "O₃", real: 32, ghost: selected.aqi * 0.2 },
						{ label: "CO", real: 1.1, ghost: selected.aqi * 0.005 },
					].map((metric) => (
						<div
							key={metric.label}
							className="rounded border border-white/5 bg-white/[0.02] p-2 text-center"
						>
							<p className="font-mono text-[7px] text-zinc-600">
								{metric.label}
							</p>
							<p className="font-mono text-[10px] font-bold text-white">
								{Math.round(metric.ghost)}
							</p>
						</div>
					))}
				</div>
			</div>
		</Modal>
	);
}
