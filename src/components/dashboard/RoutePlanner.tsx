import { motion } from "framer-motion";
import {
	ArrowRight,
	Award,
	Bike,
	Bus,
	Car,
	ChevronDown,
	Clock,
	CloudRain,
	Footprints,
	Globe,
	MapPin,
	Navigation,
	Plane,
	Search,
	Train,
	X,
} from "lucide-react";
import { useCallback, useMemo, useState } from "react";
import {
	EMISSION_RATES,
	formatCarbon,
	formatDuration,
	getAqiColor,
	getCarbonColor,
	type TransportMode,
} from "#/lib/carbon-calculator";
import type { CityDestination } from "#/lib/global-destinations";
import { BOKARO_COORDS, searchCities } from "#/lib/global-destinations";
import { getBestRoute, getRouteScore } from "#/lib/multi-modal-routes";
import { useEnvStore } from "#/store/envStore";

const MODE_ICONS: Record<TransportMode, React.ReactNode> = {
	car: <Car className="h-4 w-4" />,
	bus: <Bus className="h-4 w-4" />,
	train_electric: <Train className="h-4 w-4" />,
	train_diesel: <Train className="h-4 w-4" />,
	flight: <Plane className="h-4 w-4" />,
	bike: <Bike className="h-4 w-4" />,
	walk: <Footprints className="h-4 w-4" />,
};

const BOKARO: CityDestination = {
	id: "bokaro",
	name: "Bokaro Steel City",
	country: "India",
	region: "India",
	coords: BOKARO_COORDS,
};

export function RoutePlanner() {
	const [isCollapsed, setIsCollapsed] = useState(false);
	const [searchQuery, setSearchQuery] = useState("");
	const [showDropdown, setShowDropdown] = useState(false);
	const [filterBy] = useState<"all" | "fastest" | "greenest" | "cleanest">(
		"all",
	);

	const routeDestination = useEnvStore((s) => s.routeDestination);
	const setRouteDestination = useEnvStore((s) => s.setRouteDestination);
	const routeMode = useEnvStore((s) => s.routeMode);
	const setRouteMode = useEnvStore((s) => s.setRouteMode);
	const routeResults = useEnvStore((s) => s.routeResults);
	const setActiveRouteCoords = useEnvStore((s) => s.setActiveRouteCoords);
	const setRouteResults = useEnvStore((s) => s.setRouteResults);

	const routes = useMemo(() => {
		return Object.entries(routeResults).map(([mode, data]) => ({
			mode: mode as TransportMode,
			distanceKm: data.distanceKm,
			durationHours: data.durationHours,
			durationMinutes: data.durationMinutes,
			carbonGrams: data.carbonGrams,
			carbonKg: data.carbonKg,
			aqi: data.aqi,
			coordinates: data.coordinates,
			available: true,
		}));
	}, [routeResults]);

	const filteredRoutes = useMemo(() => {
		if (!routes.length) return [];
		if (filterBy === "all") return routes;
		const best = getBestRoute(routes, filterBy);
		if (!best) return routes;
		return routes.sort((a, b) => {
			if (a.mode === best.mode) return -1;
			if (b.mode === best.mode) return 1;
			return 0;
		});
	}, [routes, filterBy]);

	const searchResults = useMemo(() => {
		if (!searchQuery) return [];
		return searchCities(searchQuery);
	}, [searchQuery]);

	const handleSelectCity = useCallback(
		(city: CityDestination) => {
			setRouteDestination({
				id: city.id,
				name: city.name,
				country: city.country,
				coords: city.coords,
			});
			setSearchQuery("");
			setShowDropdown(false);
		},
		[setRouteDestination],
	);

	const handleModeSelect = useCallback(
		(mode: TransportMode) => {
			setRouteMode(mode);
			const route = routes.find((r) => r.mode === mode);
			if (route) {
				setActiveRouteCoords(route.coordinates);
			}
		},
		[routes, setRouteMode, setActiveRouteCoords],
	);

	const handleClear = useCallback(() => {
		setRouteDestination(null);
		setActiveRouteCoords([]);
		setRouteResults({});
	}, [setRouteDestination, setActiveRouteCoords, setRouteResults]);

	const bestGreen = useMemo(() => getBestRoute(routes, "greenest"), [routes]);
	const bestClean = useMemo(() => getBestRoute(routes, "cleanest"), [routes]);
	const bestFast = useMemo(() => getBestRoute(routes, "fastest"), [routes]);

	if (isCollapsed) {
		return (
			<motion.button
				initial={{ opacity: 0, y: 20 }}
				animate={{ opacity: 1, y: 0 }}
				transition={{ duration: 0.3 }}
				type="button"
				onClick={() => setIsCollapsed(false)}
				className="pointer-events-auto absolute bottom-4 left-[200px] z-30 flex items-center gap-2 rounded-2xl border border-teal-500/20 bg-black/95 px-4 py-2.5 shadow-2xl backdrop-blur-2xl transition-colors hover:bg-white/[0.03]"
			>
				<Globe className="h-4 w-4 text-teal-400" />
				<span className="font-mono text-[10px] font-bold uppercase tracking-widest text-teal-400">
					Routes
				</span>
				{routeDestination && (
					<span className="text-zinc-400">→ {routeDestination.name}</span>
				)}
			</motion.button>
		);
	}

	return (
		<motion.div
			initial={{ opacity: 0, y: 20, scale: 0.95 }}
			animate={{ opacity: 1, y: 0, scale: 1 }}
			exit={{ opacity: 0, y: 20, scale: 0.95 }}
			transition={{ duration: 0.4, ease: [0.16, 1, 0.3, 1] }}
			className="pointer-events-auto absolute bottom-4 left-[200px] z-30 max-h-[420px] w-[520px] overflow-hidden rounded-2xl border border-teal-500/20 bg-black/95 shadow-2xl backdrop-blur-2xl"
		>
			<div className="flex items-center justify-between border-b border-white/10 bg-gradient-to-r from-teal-500/10 to-cyan-500/10 px-4 py-3">
				<div className="flex items-center gap-2">
					<Globe className="h-5 w-5 text-teal-400" />
					<div>
						<h3 className="font-mono text-[11px] font-bold uppercase tracking-widest text-teal-400">
							Global Route Planner
						</h3>
						<p className="font-mono text-[9px] text-zinc-500">
							Carbon footprint + AQI exposure
						</p>
					</div>
				</div>
				<div className="flex items-center gap-1">
					{routeDestination && (
						<button
							type="button"
							onClick={handleClear}
							className="rounded-lg p-1.5 text-zinc-500 transition-colors hover:bg-white/10 hover:text-white"
							title="Clear route"
						>
							<X className="h-3.5 w-3.5" />
						</button>
					)}
					<button
						type="button"
						onClick={() => setIsCollapsed(true)}
						className="rounded-lg p-1.5 text-zinc-500 transition-colors hover:bg-white/10 hover:text-white"
					>
						<ChevronDown className="h-3.5 w-3.5 rotate-180" />
					</button>
				</div>
			</div>

			<div className="p-4">
				{!routeDestination && (
					<div className="mb-3 flex items-center gap-2">
						<div className="flex flex-1 items-center gap-2 rounded-lg border border-teal-500/30 bg-teal-500/10 px-3 py-2">
							<MapPin className="h-3.5 w-3.5 text-teal-400" />
							<span className="font-mono text-[10px] text-teal-400">
								{BOKARO.name}
							</span>
						</div>
						<ArrowRight className="h-4 w-4 text-zinc-500" />
						<div className="relative flex flex-1">
							<Search className="absolute left-3 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-zinc-500" />
							<input
								type="text"
								value={searchQuery}
								onChange={(e) => {
									setSearchQuery(e.target.value);
									setShowDropdown(true);
								}}
								onFocus={() => setShowDropdown(true)}
								placeholder="Search destination..."
								className="w-full rounded-lg border border-white/10 bg-white/5 py-2 pl-9 pr-3 font-mono text-[10px] text-white placeholder-zinc-600 outline-none focus:border-teal-500/50"
							/>
							{showDropdown && searchQuery && searchResults.length > 0 && (
								<div className="absolute left-0 top-full z-20 mt-1 max-h-48 w-full overflow-y-auto rounded-lg border border-white/10 bg-black/95 shadow-xl">
									{searchResults.map((city) => (
										<button
											key={city.id}
											type="button"
											onClick={() => handleSelectCity(city)}
											className="flex w-full items-center gap-2 px-3 py-2 text-left transition-colors hover:bg-white/10"
										>
											<MapPin className="h-3 w-3 text-zinc-500" />
											<span className="font-mono text-[10px] text-white">
												{city.name}
											</span>
											<span className="font-mono text-[8px] text-zinc-500">
												{city.country}
											</span>
										</button>
									))}
								</div>
							)}
						</div>
					</div>
				)}

				{!routeDestination && !searchQuery && (
					<div className="py-8 text-center">
						<Globe className="mx-auto h-8 w-8 text-zinc-600" />
						<p className="mt-2 font-mono text-[10px] text-zinc-500">
							Select a destination to compare routes
						</p>
					</div>
				)}

				{filteredRoutes.length > 0 && (
					<div className="space-y-1.5">
						{filteredRoutes.map((route) => {
							const score = getRouteScore(route);
							const isBest =
								(bestGreen?.mode === route.mode && filterBy === "greenest") ||
								(bestClean?.mode === route.mode && filterBy === "cleanest") ||
								(bestFast?.mode === route.mode && filterBy === "fastest");

							return (
								<motion.div
									key={route.mode}
									initial={{ opacity: 0, x: -10 }}
									animate={{ opacity: 1, x: 0 }}
									className={`flex cursor-pointer items-center gap-2 rounded-lg border p-2.5 transition-all ${
										routeMode === route.mode
											? "border-teal-500/50 bg-teal-500/10"
											: "border-white/5 bg-white/5 hover:border-white/20"
									}`}
									onClick={() => handleModeSelect(route.mode)}
								>
									<div
										style={{
											color: routeMode === route.mode ? "#14b8a6" : "#71717a",
										}}
									>
										{MODE_ICONS[route.mode]}
									</div>
									<div className="flex flex-1 flex-col gap-0.5">
										<div className="flex items-center justify-between">
											<span className="font-mono text-[10px] font-bold text-white">
												{EMISSION_RATES[route.mode].label}
											</span>
											{isBest && (
												<span className="flex items-center gap-0.5 rounded bg-teal-500/20 px-1 py-0.5 font-mono text-[7px] text-teal-400">
													<Award className="h-2.5 w-2.5" /> BEST
												</span>
											)}
										</div>
										<div className="grid grid-cols-4 gap-2">
											<div className="flex items-center gap-0.5">
												<Clock className="h-2.5 w-2.5 text-zinc-500" />
												<span className="font-mono text-[8px] text-zinc-400">
													{formatDuration(route.durationHours)}
												</span>
											</div>
											<div className="flex items-center gap-0.5">
												<Navigation className="h-2.5 w-2.5 text-zinc-500" />
												<span className="font-mono text-[8px] text-zinc-400">
													{route.distanceKm}km
												</span>
											</div>
											<div className="flex items-center gap-0.5">
												<CloudRain
													className="h-2.5 w-2.5"
													style={{
														color: getCarbonColor(route.carbonGrams),
													}}
												/>
												<span
													className="font-mono text-[8px] font-bold"
													style={{
														color: getCarbonColor(route.carbonGrams),
													}}
												>
													{formatCarbon(route.carbonGrams)}
												</span>
											</div>
											<div>
												<span
													className="rounded px-1 py-0.5 font-mono text-[8px] font-bold"
													style={{
														backgroundColor: `${getAqiColor(route.aqi)}20`,
														color: getAqiColor(route.aqi),
													}}
												>
													AQI {route.aqi}
												</span>
											</div>
										</div>
									</div>
									<div className="flex flex-col items-center">
										<span className="font-mono text-[10px] font-black text-teal-400">
											{score}
										</span>
										<span className="font-mono text-[6px] text-zinc-500">
											/100
										</span>
									</div>
								</motion.div>
							);
						})}
					</div>
				)}

				{(bestGreen || bestClean || bestFast) && filteredRoutes.length > 0 && (
					<div className="mt-3 rounded-lg border border-white/10 bg-white/5 p-2">
						<p className="mb-1.5 font-mono text-[8px] uppercase tracking-wider text-zinc-500">
							Recommendations
						</p>
						<div className="grid grid-cols-3 gap-2">
							<div className="rounded border border-emerald-500/20 bg-emerald-500/5 p-1.5 text-center">
								<p className="font-mono text-[7px] text-emerald-400">
									Greenest
								</p>
								<p className="font-mono text-[9px] font-bold text-white">
									{EMISSION_RATES[bestGreen?.mode ?? "walk"]?.label ?? "-"}
								</p>
							</div>
							<div className="rounded border border-cyan-500/20 bg-cyan-500/5 p-1.5 text-center">
								<p className="font-mono text-[7px] text-cyan-400">Cleanest</p>
								<p className="font-mono text-[9px] font-bold text-white">
									{EMISSION_RATES[bestClean?.mode ?? "walk"]?.label ?? "-"}
								</p>
							</div>
							<div className="rounded border border-amber-500/20 bg-amber-500/5 p-1.5 text-center">
								<p className="font-mono text-[7px] text-amber-400">Fastest</p>
								<p className="font-mono text-[9px] font-bold text-white">
									{EMISSION_RATES[bestFast?.mode ?? "flight"]?.label ?? "-"}
								</p>
							</div>
						</div>
					</div>
				)}
			</div>
		</motion.div>
	);
}
