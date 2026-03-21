import { motion } from "framer-motion";
import { ChevronLeft, ChevronRight, RotateCcw, Zap } from "lucide-react";
import { useMemo, useState } from "react";
import { getAqiMeta } from "#/lib/air-quality";
import { useEnvStore } from "#/store/envStore";

export interface PolicyIntervention {
	id: string;
	name: string;
	description: string;
	effect: number;
	maxReduction: number;
	unit: string;
}

export interface CityPolicy {
	cityId: string;
	cityName: string;
	interventions: PolicyIntervention[];
}

const DEFAULT_POLICIES: CityPolicy[] = [
	{
		cityId: "sf-bay",
		cityName: "San Francisco Bay Area",
		interventions: [
			{
				id: "heavy-vehicles",
				name: "Restrict Heavy Vehicles",
				description: "Limit diesel trucks in high-density zones",
				effect: 0,
				maxReduction: 35,
				unit: "% restriction",
			},
			{
				id: "construction",
				name: "Construction Activity Halt",
				description: "Pause dust-generating construction work",
				effect: 0,
				maxReduction: 20,
				unit: "% halt",
			},
			{
				id: "street-misting",
				name: "Street Misting",
				description: "Activate water misting systems",
				effect: 0,
				maxReduction: 15,
				unit: "% coverage",
			},
			{
				id: "industrial-emissions",
				name: "Industrial Emissions Cap",
				description: "Temporarily reduce factory output",
				effect: 0,
				maxReduction: 25,
				unit: "% cap",
			},
			{
				id: "public-transit",
				name: "Free Public Transit",
				description: "Waive transit fares to reduce car trips",
				effect: 0,
				maxReduction: 18,
				unit: "% free fares",
			},
			{
				id: "staggered-hours",
				name: "Staggered Work Hours",
				description: "Flexible office hours to decongest rush",
				effect: 0,
				maxReduction: 12,
				unit: "% stagger",
			},
		],
	},
	{
		cityId: "delhi",
		cityName: "Delhi NCR",
		interventions: [
			{
				id: "heavy-vehicles",
				name: "Restrict Heavy Vehicles",
				description: "Odd-even vehicle scheme enforcement",
				effect: 0,
				maxReduction: 40,
				unit: "% restriction",
			},
			{
				id: "construction",
				name: "Construction Activity Halt",
				description: "GRAP IV+ emergency construction ban",
				effect: 0,
				maxReduction: 30,
				unit: "% halt",
			},
			{
				id: "street-misting",
				name: "Street Misting",
				description: "Deploy mobile misting units",
				effect: 0,
				maxReduction: 20,
				unit: "% coverage",
			},
			{
				id: "industrial-emissions",
				name: "Industrial Emissions Cap",
				description: "Thermal plant load reduction",
				effect: 0,
				maxReduction: 35,
				unit: "% cap",
			},
			{
				id: "public-transit",
				name: "Free Public Transit",
				description: "Free bus and metro rides during alert",
				effect: 0,
				maxReduction: 25,
				unit: "% free fares",
			},
			{
				id: "staggered-hours",
				name: "Staggered Work Hours",
				description: "Government offices on flex schedules",
				effect: 0,
				maxReduction: 15,
				unit: "% stagger",
			},
		],
	},
	{
		cityId: "beijing",
		cityName: "Beijing-Tianjin-Hebei",
		interventions: [
			{
				id: "heavy-vehicles",
				name: "Restrict Heavy Vehicles",
				description: "Odd-even license plate policy",
				effect: 0,
				maxReduction: 45,
				unit: "% restriction",
			},
			{
				id: "construction",
				name: "Construction Activity Halt",
				description: "Non-essential construction suspension",
				effect: 0,
				maxReduction: 25,
				unit: "% halt",
			},
			{
				id: "street-misting",
				name: "Street Misting",
				description: "Urban misting network activation",
				effect: 0,
				maxReduction: 18,
				unit: "% coverage",
			},
			{
				id: "industrial-emissions",
				name: "Industrial Emissions Cap",
				description: "Steel & cement output limits",
				effect: 0,
				maxReduction: 30,
				unit: "% cap",
			},
			{
				id: "public-transit",
				name: "Free Public Transit",
				description: "Municipal transit fare subsidy",
				effect: 0,
				maxReduction: 20,
				unit: "% free fares",
			},
			{
				id: "staggered-hours",
				name: "Staggered Work Hours",
				description: "State enterprise flex-time policy",
				effect: 0,
				maxReduction: 10,
				unit: "% stagger",
			},
		],
	},
	{
		cityId: "mumbai",
		cityName: "Mumbai Metropolitan",
		interventions: [
			{
				id: "heavy-vehicles",
				name: "Restrict Heavy Vehicles",
				description: "Diesel ban in coastal zones",
				effect: 0,
				maxReduction: 30,
				unit: "% restriction",
			},
			{
				id: "construction",
				name: "Construction Activity Halt",
				description: "Stop demolition and earthworks",
				effect: 0,
				maxReduction: 22,
				unit: "% halt",
			},
			{
				id: "street-misting",
				name: "Street Misting",
				description: "Water cannon trucks on highways",
				effect: 0,
				maxReduction: 15,
				unit: "% coverage",
			},
			{
				id: "industrial-emissions",
				name: "Industrial Emissions Cap",
				description: "Reduce thermal plant generation",
				effect: 0,
				maxReduction: 28,
				unit: "% cap",
			},
			{
				id: "public-transit",
				name: "Free Public Transit",
				description: "BEST bus fare waiver during alert",
				effect: 0,
				maxReduction: 22,
				unit: "% free fares",
			},
			{
				id: "staggered-hours",
				name: "Staggered Work Hours",
				description: "IT parks on alternating shifts",
				effect: 0,
				maxReduction: 14,
				unit: "% stagger",
			},
		],
	},
	{
		cityId: "london",
		cityName: "London Greater Area",
		interventions: [
			{
				id: "heavy-vehicles",
				name: "Restrict Heavy Vehicles",
				description: "Ultra-low emission zone expansion",
				effect: 0,
				maxReduction: 38,
				unit: "% restriction",
			},
			{
				id: "construction",
				name: "Construction Activity Halt",
				description: "Dust suppression mandate on sites",
				effect: 0,
				maxReduction: 15,
				unit: "% halt",
			},
			{
				id: "street-misting",
				name: "Street Misting",
				description: "Highway water spray systems",
				effect: 0,
				maxReduction: 10,
				unit: "% coverage",
			},
			{
				id: "industrial-emissions",
				name: "Industrial Emissions Cap",
				description: "UK ETS cap tightening",
				effect: 0,
				maxReduction: 20,
				unit: "% cap",
			},
			{
				id: "public-transit",
				name: "Free Public Transit",
				description: "TfL fare holiday on alert days",
				effect: 0,
				maxReduction: 16,
				unit: "% free fares",
			},
			{
				id: "staggered-hours",
				name: "Staggered Work Hours",
				description: "Crossrail and commute dispersal",
				effect: 0,
				maxReduction: 11,
				unit: "% stagger",
			},
		],
	},
];

function calculateProjectedAqi(
	baseAqi: number,
	interventions: PolicyIntervention[],
): number {
	const totalReduction = interventions.reduce((sum, intervention) => {
		return sum + (intervention.effect / 100) * intervention.maxReduction;
	}, 0);
	return Math.round(Math.max(0, baseAqi * (1 - totalReduction / 100)));
}

function calculateHealthSavings(projectedReduction: number): string {
	const savingsPerDay = projectedReduction * 120;
	if (savingsPerDay >= 1000)
		return `$${(savingsPerDay / 1000).toFixed(1)}k/day`;
	return `$${Math.round(savingsPerDay)}/day`;
}

function calculatePopulationProtected(
	interventions: PolicyIntervention[],
	totalPopulation: number,
): number {
	const coverageEffect =
		interventions.find((i) => i.id === "street-misting")?.effect ?? 0;
	const restrictionEffect =
		interventions.find((i) => i.id === "heavy-vehicles")?.effect ?? 0;
	const protectionFactor = (coverageEffect + restrictionEffect) / 200;
	return Math.round(totalPopulation * protectionFactor);
}

function AqiBadge({ value }: { value: number }) {
	const color =
		value > 100
			? "#dc2626"
			: value > 70
				? "#f97316"
				: value > 50
					? "#eab308"
					: "#22c55e";
	return (
		<span
			className="rounded px-1.5 py-0.5 font-mono text-[11px] font-bold"
			style={{ backgroundColor: `${color}25`, color }}
		>
			AQI {value}
		</span>
	);
}

export function PolicySimulator() {
	const identifiedSources = useEnvStore((s) => s.identifiedSources);
	const setProjectionMode = useEnvStore((s) => s.setProjectionMode);
	const setShowProjectionOnMap = useEnvStore((s) => s.setShowProjectionOnMap);
	const setActiveInterventions = useEnvStore((s) => s.setActiveInterventions);
	const setProjectedAqiDelta = useEnvStore((s) => s.setProjectedAqiDelta);
	const selectedRegion = useEnvStore((s) => s.selectedRegion);
	const navigationRoutes = useEnvStore((s) => s.navigationRoutes);
	const showProjectionOnMap = useEnvStore((s) => s.showProjectionOnMap);
	const selectedRouteId = useEnvStore((s) => s.selectedRouteId);
	const setSelectedRouteId = useEnvStore((s) => s.setSelectedRouteId);

	const [selectedCity, setSelectedCity] = useState<string>("auto");
	const [interventions, setInterventions] = useState<PolicyIntervention[]>(
		() => {
			if (selectedRegion.id !== "auto") {
				const policy = DEFAULT_POLICIES.find(
					(p) => p.cityId === selectedRegion.id,
				);
				return policy?.interventions ?? DEFAULT_POLICIES[0].interventions;
			}
			return DEFAULT_POLICIES[0].interventions;
		},
	);
	const [isCollapsed, setIsCollapsed] = useState(false);

	const cityPolicies = useMemo(() => DEFAULT_POLICIES, []);

	const baseAqi = identifiedSources[0]?.aqi ?? 85;
	const projectedAqi = useMemo(
		() => calculateProjectedAqi(baseAqi, interventions),
		[baseAqi, interventions],
	);
	const aqiReduction = baseAqi - projectedAqi;
	const reductionPercent = Math.round((aqiReduction / baseAqi) * 100);
	const projectedMeta = getAqiMeta(projectedAqi);
	const baseMeta = getAqiMeta(baseAqi);
	const healthSavings = calculateHealthSavings(aqiReduction);
	const populationProtected = calculatePopulationProtected(
		interventions,
		45000,
	);
	const isActive = interventions.some((i) => i.effect > 0);

	const fastest = navigationRoutes.fastest;
	const cleanest = navigationRoutes.cleanest;
	const activeTab =
		selectedRouteId ||
		(cleanest && fastest
			? cleanest.aqi < fastest.aqi
				? "cleanest"
				: "fastest"
			: fastest
				? "fastest"
				: cleanest
					? "cleanest"
					: null);

	const handleInterventionChange = (id: string, value: number) => {
		setInterventions((prev) => {
			const updated = prev.map((i) =>
				i.id === id ? { ...i, effect: value } : i,
			);
			const reduction = updated.reduce(
				(sum, i) => sum + (i.effect / 100) * i.maxReduction,
				0,
			);
			setActiveInterventions(
				updated.map((i) => ({
					id: i.id,
					effect: i.effect,
					maxReduction: i.maxReduction,
				})),
			);
			setProjectedAqiDelta(reduction);
			return updated;
		});
	};

	const handleCityChange = (cityId: string) => {
		setSelectedCity(cityId);
		if (cityId === "auto") {
			setInterventions(DEFAULT_POLICIES[0].interventions);
			return;
		}
		const policy = cityPolicies.find((p) => p.cityId === cityId);
		if (policy) setInterventions(policy.interventions);
	};

	const handleReset = () => {
		setInterventions((prev) => prev.map((i) => ({ ...i, effect: 0 })));
		setActiveInterventions([]);
		setProjectedAqiDelta(0);
		setProjectionMode(false);
		setShowProjectionOnMap(false);
	};

	const handleTabSelect = (tab: string) => {
		setSelectedRouteId(tab);
	};

	const handleProjectionToggle = () => {
		const next = !showProjectionOnMap;
		setProjectionMode(next);
		setShowProjectionOnMap(next);
	};

	const reductionPct = Math.min(100, Math.round((aqiReduction / 80) * 100));
	const reductionColor =
		aqiReduction > 40
			? "#22c55e"
			: aqiReduction > 20
				? "#eab308"
				: aqiReduction > 10
					? "#f97316"
					: "#dc2626";

	const COLORS = [
		"#ef4444",
		"#f97316",
		"#eab308",
		"#22c55e",
		"#38bdf8",
		"#a78bfa",
	];

	return (
		<>
			{isCollapsed && (
				<motion.button
					initial={{ opacity: 0, scale: 0.9 }}
					animate={{ opacity: 1, scale: 1 }}
					transition={{ duration: 0.3 }}
					type="button"
					onClick={() => setIsCollapsed(false)}
					className="pointer-events-auto absolute left-0 top-28 z-30 flex cursor-pointer items-center gap-2 rounded-r-xl border border-amber-500/30 border-l-0 bg-black/90 px-2 py-3 shadow-xl backdrop-blur-xl transition-all hover:bg-black group"
				>
					<div className="flex flex-col items-center gap-1">
						<Zap className="h-4 w-4 text-amber-400" />
						<span
							className="writing-vertical-rl text-[9px] font-bold uppercase tracking-widest text-amber-400"
							style={{ writingMode: "vertical-rl" }}
						>
							Simulator
						</span>
					</div>
					<ChevronRight className="h-3 w-3 text-amber-400/50 transition-transform group-hover:translate-x-0.5" />
				</motion.button>
			)}

			{!isCollapsed && (
				<motion.div
					initial={{ opacity: 0, x: -24, scale: 0.97 }}
					animate={{ opacity: 1, x: 0, scale: 1 }}
					exit={{ opacity: 0, x: -24, scale: 0.97 }}
					transition={{ duration: 0.4, ease: [0.16, 1, 0.3, 1] }}
					className="pointer-events-auto absolute left-4 top-20 z-30 w-80 rounded-2xl border border-amber-500/20 bg-black/90 text-white shadow-2xl backdrop-blur-2xl sm:w-[22rem]"
				>
					<div className="flex h-full max-h-[calc(100vh-10rem)] flex-col">
						<div className="flex flex-col gap-3 overflow-y-auto p-4">
							<div className="flex items-center justify-between">
								<div className="flex items-center gap-2">
									<div className="flex h-7 w-7 items-center justify-center rounded-lg bg-amber-500/20">
										<Zap className="h-3.5 w-3.5 text-amber-400" />
									</div>
									<div>
										<h3 className="font-mono text-[11px] font-bold uppercase tracking-[0.2em] text-amber-400">
											Response Simulator
										</h3>
										<p className="font-mono text-[9px] text-zinc-500">
											Strategic Air Quality Control
										</p>
									</div>
								</div>
								<div className="flex items-center gap-1.5">
									{isActive && (
										<button
											type="button"
											onClick={handleReset}
											className="cursor-pointer rounded-lg p-1.5 text-zinc-500 transition-colors hover:bg-red-500/20 hover:text-red-400"
											title="Reset all interventions"
										>
											<RotateCcw className="h-3.5 w-3.5" />
										</button>
									)}
									<button
										type="button"
										onClick={() => setIsCollapsed(true)}
										className="cursor-pointer rounded-lg p-1.5 text-zinc-500 transition-colors hover:bg-white/10 hover:text-white"
										title="Minimize"
									>
										<ChevronLeft className="h-3.5 w-3.5" />
									</button>
								</div>
							</div>

							<div className="rounded-lg border border-white/5 bg-white/[0.03] p-2">
								<div className="mb-1.5 flex items-center justify-between">
									<span className="font-mono text-[9px] uppercase tracking-widest text-zinc-500">
										Zone
									</span>
									<select
										value={selectedCity}
										onChange={(e) => handleCityChange(e.target.value)}
										className="w-1/2 rounded border border-white/10 bg-black/40 px-2 py-1 font-mono text-[10px] text-emerald-400 focus:border-amber-500/50 focus:outline-none"
									>
										<option value="auto">AUTO / MY LOCATION</option>
										{cityPolicies.map((policy) => (
											<option key={policy.cityId} value={policy.cityId}>
												{policy.cityName.toUpperCase()}
											</option>
										))}
									</select>
								</div>

								{(fastest || cleanest) && (
									<div className="flex gap-1">
										{fastest && (
											<button
												type="button"
												onClick={() => handleTabSelect("fastest")}
												className={`flex flex-1 flex-col items-center gap-0.5 rounded-lg px-2 py-1.5 font-mono text-[10px] font-bold transition-all ${
													activeTab === "fastest"
														? "border border-amber-500/40 bg-amber-500/15 text-amber-300"
														: "border border-white/5 bg-black/40 text-zinc-400 hover:border-white/10"
												}`}
											>
												<span>FASTEST</span>
												<AqiBadge value={Math.round(fastest.aqi)} />
											</button>
										)}
										{cleanest && (
											<button
												type="button"
												onClick={() => handleTabSelect("cleanest")}
												className={`flex flex-1 flex-col items-center gap-0.5 rounded-lg px-2 py-1.5 font-mono text-[10px] font-bold transition-all ${
													activeTab === "cleanest"
														? "border border-sky-500/40 bg-sky-500/15 text-sky-300"
														: "border border-white/5 bg-black/40 text-zinc-400 hover:border-white/10"
												}`}
											>
												<span>BLUE-SKY</span>
												<AqiBadge value={Math.round(cleanest.aqi)} />
											</button>
										)}
									</div>
								)}
							</div>

							<div className="grid grid-cols-2 gap-2">
								<div className="rounded-lg border border-emerald-500/20 bg-emerald-500/5 p-2.5">
									<p className="font-mono text-[8px] uppercase tracking-widest text-emerald-400/60">
										Current
									</p>
									<p className="font-mono text-lg font-black text-zinc-400 line-through">
										{baseAqi}
									</p>
									<p className="font-mono text-[9px] text-zinc-600">
										{baseMeta.label}
									</p>
								</div>
								<div className="rounded-lg border border-emerald-500/30 bg-emerald-500/10 p-2.5">
									<p className="font-mono text-[8px] uppercase tracking-widest text-emerald-300/80">
										Projected
									</p>
									<p
										className="font-mono text-lg font-black"
										style={{ color: reductionColor }}
									>
										{projectedAqi}
									</p>
									<p className="font-mono text-[9px] text-emerald-300/70">
										{projectedMeta.label}
									</p>
								</div>
							</div>

							{isActive && (
								<div className="space-y-1.5">
									<div className="flex items-center justify-between font-mono text-[9px] text-zinc-500">
										<span>
											Reduction: -{aqiReduction} AQI ({reductionPercent}%)
										</span>
										<span style={{ color: reductionColor }}>
											↓ {reductionPct}%
										</span>
									</div>
									<div className="h-2 w-full overflow-hidden rounded-full bg-white/5">
										<motion.div
											className="h-full rounded-full"
											style={{ backgroundColor: reductionColor }}
											initial={{ width: 0 }}
											animate={{ width: `${reductionPct}%` }}
											transition={{ duration: 0.6, ease: "easeOut" }}
										/>
									</div>
									<div className="flex items-center gap-2 rounded bg-black/40 px-2 py-1 font-mono text-[9px] text-emerald-300/80">
										<div className="h-1.5 w-1.5 rounded-full bg-emerald-400 animate-pulse" />
										<span>
											PM2.5 -{Math.round(aqiReduction * 0.9)}% in ~45 min
										</span>
									</div>
								</div>
							)}

							<div className="rounded-lg border border-white/5 bg-white/[0.03] p-2">
								<div className="mb-1.5 flex items-center justify-between">
									<span className="font-mono text-[9px] uppercase tracking-widest text-zinc-500">
										Live Map Projection
									</span>
									<button
										type="button"
										onClick={handleProjectionToggle}
										className={`relative h-5 w-9 rounded-full transition-colors ${showProjectionOnMap ? "bg-emerald-500" : "bg-zinc-700"}`}
									>
										<span
											className={`absolute top-0.5 h-4 w-4 rounded-full bg-white shadow transition-transform ${showProjectionOnMap ? "translate-x-4" : "translate-x-0.5"}`}
										/>
									</button>
								</div>
								{showProjectionOnMap && aqiReduction > 0 && (
									<div className="flex items-center gap-2 rounded bg-emerald-500/10 px-2 py-1 font-mono text-[10px] text-emerald-300">
										<span>Δ</span>
										<span className="font-bold">
											-{Math.round(projectedAqi)} AQI
										</span>
										<span className="text-emerald-400/60">zones updated</span>
									</div>
								)}
							</div>

							{isActive && (
								<div className="flex items-center gap-1.5 overflow-hidden rounded-full bg-zinc-800 p-0.5">
									{interventions
										.filter((i) => i.effect > 0)
										.map((i, idx) => {
											const pct =
												aqiReduction > 0
													? Math.round(
															(((i.effect / 100) * i.maxReduction) /
																aqiReduction) *
																100,
														)
													: 0;
											return (
												<div
													key={i.id}
													className="h-3 rounded-full transition-all duration-500"
													style={{
														width: `${Math.max(pct, 3)}%`,
														backgroundColor: COLORS[idx % COLORS.length],
													}}
													title={`${i.name}: ${pct}%`}
												/>
											);
										})}
								</div>
							)}

							<div className="space-y-1.5">
								<p className="font-mono text-[9px] uppercase tracking-widest text-zinc-600">
									Interventions
								</p>
								{interventions.map((intervention, idx) => {
									const active = intervention.effect > 0;
									return (
										<div
											key={intervention.id}
											className="rounded-lg border border-white/5 bg-white/[0.02] p-2.5 transition-colors"
											style={{
												borderColor: active
													? `${COLORS[idx % COLORS.length]}30`
													: undefined,
											}}
										>
											<div className="mb-1.5 flex items-start justify-between gap-2">
												<div className="min-w-0 flex-1">
													<p className="font-mono text-[10px] font-bold text-white truncate">
														{intervention.name}
													</p>
													<p className="font-mono text-[8px] text-zinc-600">
														{intervention.description}
													</p>
												</div>
												<span
													className="shrink-0 font-mono text-[11px] font-bold"
													style={{
														color: active
															? COLORS[idx % COLORS.length]
															: "#52525b",
													}}
												>
													{intervention.effect}%
												</span>
											</div>
											<div className="relative h-1.5 w-full overflow-hidden rounded-full bg-white/5">
												<motion.div
													className="absolute left-0 top-0 h-full rounded-full"
													style={{
														backgroundColor: COLORS[idx % COLORS.length],
													}}
													animate={{ width: `${intervention.effect}%` }}
													transition={{ duration: 0.3 }}
												/>
											</div>
											<input
												type="range"
												min="0"
												max="100"
												value={intervention.effect}
												onChange={(e) =>
													handleInterventionChange(
														intervention.id,
														Number.parseInt(e.target.value, 10),
													)
												}
												className="mt-1.5 h-1 w-full cursor-pointer appearance-none rounded-full"
												style={{
													background: `linear-gradient(to right, ${COLORS[idx % COLORS.length]} ${intervention.effect}%, #27272a ${intervention.effect}%)`,
												}}
											/>
										</div>
									);
								})}
							</div>

							<div className="grid grid-cols-2 gap-2">
								<div className="rounded-lg border border-emerald-500/20 bg-emerald-500/5 p-2.5 text-center">
									<p className="font-mono text-[8px] uppercase tracking-widest text-emerald-400/60">
										Health Savings
									</p>
									<p className="font-mono text-sm font-black text-emerald-400">
										{isActive ? healthSavings : "$0/day"}
									</p>
								</div>
								<div className="rounded-lg border border-sky-500/20 bg-sky-500/5 p-2.5 text-center">
									<p className="font-mono text-[8px] uppercase tracking-widest text-sky-400/60">
										Pop. Protected
									</p>
									<p className="font-mono text-sm font-black text-sky-400">
										{populationProtected.toLocaleString()}
									</p>
								</div>
							</div>

							<button
								type="button"
								disabled={!isActive}
								className="group relative w-full overflow-hidden rounded-xl bg-gradient-to-r from-amber-500 to-orange-500 px-4 py-3 font-mono text-[11px] font-bold uppercase tracking-widest text-white shadow-lg shadow-amber-500/30 transition-all hover:from-amber-400 hover:to-orange-400 disabled:cursor-not-allowed disabled:opacity-30 disabled:shadow-none"
							>
								{isActive
									? "→ Dispatch Intervention Orders"
									: "→ Configure Interventions Above"}
							</button>
						</div>
					</div>
				</motion.div>
			)}
		</>
	);
}
