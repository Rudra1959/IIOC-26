import { useUser } from "@clerk/clerk-react";
import { useQuery as useTanstackQuery } from "@tanstack/react-query";
import { useQuery as useConvexQuery, useMutation } from "convex/react";
import { AnimatePresence, motion } from "framer-motion";
import {
	Activity,
	BarChart3,
	Car,
	CheckCircle2,
	ChevronDown,
	ChevronRight,
	ChevronUp,
	Droplets,
	Filter,
	Globe,
	Heart,
	Leaf,
	Play,
	RefreshCw,
	Search,
	Shield,
	Square,
	Sun,
	Thermometer,
	TrendingDown,
	TrendingUp,
	TriangleAlert,
	Wind,
} from "lucide-react";
import { useEffect, useState } from "react";
import { api } from "../../../convex/_generated/api";
import type { Id } from "../../../convex/_generated/dataModel";
import {
	type AqiBand,
	getAqiMeta,
	getNearestCleanZone,
} from "../../lib/air-quality";
import {
	calculateAirQualityMetrics,
	type EnvironmentalSnapshot,
	fetchEnvironmentalSnapshot,
	fetchHourlyForecast,
	type HourlyForecast,
	type PlaceSearchResult,
	searchPlaces,
} from "../../lib/environment";
import { useEnvStore } from "../../store/envStore";
import { Input } from "../ui/input";

const aqiBandStyles: Record<
	AqiBand,
	{ text: string; badge: string; bg: string }
> = {
	good: {
		text: "text-emerald-400",
		badge: "bg-emerald-500/15 text-emerald-300 border border-emerald-500/30",
		bg: "from-emerald-500/20 to-emerald-500/5",
	},
	moderate: {
		text: "text-yellow-300",
		badge: "bg-yellow-500/15 text-yellow-200 border border-yellow-500/30",
		bg: "from-yellow-500/20 to-yellow-500/5",
	},
	"unhealthy-sensitive": {
		text: "text-orange-300",
		badge: "bg-orange-500/15 text-orange-200 border border-orange-500/30",
		bg: "from-orange-500/20 to-orange-500/5",
	},
	unhealthy: {
		text: "text-red-400",
		badge: "bg-red-500/15 text-red-300 border border-red-500/30",
		bg: "from-red-500/20 to-red-500/5",
	},
	"very-unhealthy": {
		text: "text-fuchsia-300",
		badge: "bg-fuchsia-500/15 text-fuchsia-200 border border-fuchsia-500/30",
		bg: "from-fuchsia-500/20 to-fuchsia-500/5",
	},
	hazardous: {
		text: "text-rose-300",
		badge: "bg-rose-500/15 text-rose-200 border border-rose-500/30",
		bg: "from-rose-500/20 to-rose-500/5",
	},
};

function formatReading(value: number | null | undefined, digits = 0) {
	if (value == null) return "--";
	return value.toFixed(digits);
}

function formatUpdatedTime(snapshot: EnvironmentalSnapshot | undefined) {
	if (!snapshot?.updatedAt) return "Waiting for live sensor feed";
	const date = new Date(snapshot.updatedAt);
	if (Number.isNaN(date.getTime())) return snapshot.updatedAt;
	return date.toLocaleTimeString([], { hour: "numeric", minute: "2-digit" });
}

interface ExpandableSectionProps {
	title: string;
	icon: React.ReactNode;
	isOpen: boolean;
	onToggle: () => void;
	children: React.ReactNode;
}

function ExpandableSection({
	title,
	icon,
	isOpen,
	onToggle,
	children,
}: ExpandableSectionProps) {
	return (
		<div className="mt-3 rounded-xl border border-white/10 bg-white/5 overflow-hidden">
			<button
				type="button"
				onClick={onToggle}
				className="flex w-full items-center justify-between p-3 text-left transition-colors hover:bg-white/5"
			>
				<div className="flex items-center gap-2">
					<span className="text-emerald-400">{icon}</span>
					<span className="text-sm font-semibold text-white">{title}</span>
				</div>
				<ChevronDown
					className={`h-4 w-4 text-zinc-400 transition-transform ${isOpen ? "rotate-180" : ""}`}
				/>
			</button>
			<AnimatePresence>
				{isOpen && (
					<motion.div
						initial={{ height: 0, opacity: 0 }}
						animate={{ height: "auto", opacity: 1 }}
						exit={{ height: 0, opacity: 0 }}
						transition={{ duration: 0.2 }}
						className="overflow-hidden"
					>
						<div className="p-3 pt-0">{children}</div>
					</motion.div>
				)}
			</AnimatePresence>
		</div>
	);
}

function AqiGauge({ value, band }: { value: number; band: AqiBand }) {
	const styles = aqiBandStyles[band];
	const percentage = Math.min((value / 300) * 100, 100);
	return (
		<div className="relative flex items-center justify-center">
			<svg
				className="h-32 w-32 -rotate-90"
				viewBox="0 0 100 100"
				aria-label={`AQI Gauge showing ${value}`}
			>
				<title>AQI Gauge - {value}</title>
				<circle
					cx="50"
					cy="50"
					r="42"
					fill="none"
					stroke="rgba(255,255,255,0.1)"
					strokeWidth="8"
				/>
				<circle
					cx="50"
					cy="50"
					r="42"
					fill="none"
					stroke="currentColor"
					strokeWidth="8"
					strokeDasharray={`${percentage * 2.64} 264`}
					strokeLinecap="round"
					className={`${styles.text} transition-all duration-1000`}
				/>
			</svg>
			<div className="absolute inset-0 flex flex-col items-center justify-center">
				<span className={`text-4xl font-black ${styles.text}`}>{value}</span>
				<span className="text-[10px] uppercase tracking-wider text-zinc-500">
					US AQI
				</span>
			</div>
		</div>
	);
}

function HourlyChart({ data }: { data: HourlyForecast[] }) {
	const maxAqi = Math.max(...data.map((d) => d.aqi), 100);
	const currentHour = new Date().getHours();
	return (
		<div className="space-y-2">
			<div className="flex h-16 items-end gap-1">
				{data.slice(0, 12).map((hour, i) => {
					const hourDate = new Date(hour.time);
					const hourLabel = hourDate.getHours();
					const isNow = Math.abs(hourLabel - currentHour) <= 1;
					const height = (hour.aqi / maxAqi) * 100;
					const isGood = hour.aqi < 50;
					const isBad = hour.aqi > 100;
					return (
						<div
							key={i}
							className="relative flex flex-1 flex-col items-center gap-1"
						>
							<div
								className={`w-full rounded-t transition-all duration-500 ${isNow ? "bg-emerald-400" : isBad ? "bg-red-500/60" : isGood ? "bg-emerald-500/40" : "bg-yellow-500/40"}`}
								style={{ height: `${Math.max(height, 10)}%` }}
							/>
							{isNow && (
								<div className="absolute -top-1 h-2 w-2 rounded-full bg-emerald-400" />
							)}
							<span className="text-[8px] text-zinc-500">{hourLabel}:00</span>
						</div>
					);
				})}
			</div>
			<div className="flex justify-between text-[9px] text-zinc-500">
				<span>Now</span>
				<span>+12h</span>
			</div>
		</div>
	);
}

function LiveIndicator() {
	return (
		<div className="flex items-center gap-1.5">
			<div className="relative">
				<div className="h-2 w-2 rounded-full bg-emerald-500" />
				<div className="absolute inset-0 animate-ping rounded-full bg-emerald-500 opacity-75" />
			</div>
			<span className="text-[10px] font-medium text-emerald-400">LIVE</span>
		</div>
	);
}

export function CitizenView() {
	const { user } = useUser();
	const dbUser = useConvexQuery(
		api.users.getByClerkId,
		user ? { clerkId: user.id } : "skip",
	);
	const completeCleanup = useMutation(api.cleanups.completeCleanup);
	const submitSurvey = useMutation(api.cleanups.submitSurvey);

	const userLocation = useEnvStore((s) => s.userLocation);
	const greenDestination = useEnvStore((s) => s.greenDestination);
	const setGreenDestination = useEnvStore((s) => s.setGreenDestination);
	const setActiveSearchPlace = useEnvStore((s) => s.setActiveSearchPlace);
	const addComparePlace = useEnvStore((s) => s.addComparePlace);
	const comparePlaces = useEnvStore((s) => s.comparePlaces);
	const setMapFocus = useEnvStore((s) => s.setMapFocus);
	const setCurrentAqi = useEnvStore((s) => s.setCurrentAqi);
	const selectedRegion = useEnvStore((s) => s.selectedRegion);
	const setSelectedRegion = useEnvStore((s) => s.setSelectedRegion);
	const availableRegions = useEnvStore((s) => s.availableRegions);
	const setAirQualityCalculations = useEnvStore(
		(s) => s.setAirQualityCalculations,
	);
	const setHourlyForecast = useEnvStore((s) => s.setHourlyForecast);
	const hourlyForecast = useEnvStore((s) => s.hourlyForecast);
	const setNavigationRoutes = useEnvStore((s) => s.setNavigationRoutes);
	const setSelectedRouteId = useEnvStore((s) => s.setSelectedRouteId);

	const [placeQuery, setPlaceQuery] = useState("");
	const [placeResults, setPlaceResults] = useState<PlaceSearchResult[]>([]);
	const [isSearchingPlaces, setIsSearchingPlaces] = useState(false);
	const [placeSearchError, setPlaceSearchError] = useState("");
	const [isCleaning, setIsCleaning] = useState(false);
	const [showPulseCheck, setShowPulseCheck] = useState(false);
	const [cleanupId, setCleanupId] = useState<Id<"cleanups"> | null>(null);
	const [questions, setQuestions] = useState({
		safety: 5,
		accuracy: 5,
		comments: "",
	});
	const [expandedSections, setExpandedSections] = useState<
		Record<string, boolean>
	>({ pollutants: false, forecast: false, recommendations: false });
	const [isCollapsed, setIsCollapsed] = useState(false);

	const localEnvironmentQuery = useTanstackQuery({
		queryKey: ["environment", "local", userLocation?.[0], userLocation?.[1]],
		enabled: Boolean(userLocation),
		staleTime: 60 * 1000,
		gcTime: 5 * 60 * 1000,
		retry: 2,
		refetchInterval: 60 * 1000,
		queryFn: () => {
			if (!userLocation) throw new Error("User location is unavailable.");
			return fetchEnvironmentalSnapshot({
				latitude: userLocation[1],
				longitude: userLocation[0],
				label: "Current location",
			});
		},
	});

	const hourlyQuery = useTanstackQuery({
		queryKey: ["hourly", userLocation?.[0], userLocation?.[1]],
		enabled: Boolean(userLocation),
		staleTime: 5 * 60 * 1000,
		gcTime: 15 * 60 * 1000,
		queryFn: async () => {
			if (!userLocation) throw new Error("User location unavailable.");
			const forecast = await fetchHourlyForecast({
				latitude: userLocation[1],
				longitude: userLocation[0],
			});
			setHourlyForecast(forecast);
			return forecast;
		},
	});

	const localEnvironment = localEnvironmentQuery.data;

	useEffect(() => {
		if (localEnvironment?.aqi != null) {
			setCurrentAqi(localEnvironment.aqi);
		}
	}, [localEnvironment?.aqi, setCurrentAqi]);

	useEffect(() => {
		if (localEnvironment && hourlyForecast.length > 0) {
			const calc = calculateAirQualityMetrics(
				localEnvironment,
				hourlyForecast,
				selectedRegion.defaultAqi,
			);
			setAirQualityCalculations(calc);
		}
	}, [
		localEnvironment,
		hourlyForecast,
		selectedRegion.defaultAqi,
		setAirQualityCalculations,
	]);

	const calculations = useEnvStore((s) => s.airQualityCalculations);
	const band = localEnvironment?.aqiBand ?? "moderate";
	const bandStyles = aqiBandStyles[band];
	const aqiValue = localEnvironment?.aqi ?? 50;
	const meta = getAqiMeta(aqiValue);

	const toggleSection = (section: string) => {
		setExpandedSections((prev) => ({ ...prev, [section]: !prev[section] }));
	};

	const handleSelectPlace = (place: PlaceSearchResult) => {
		setActiveSearchPlace(place);
		setPlaceQuery(place.label);
		setPlaceSearchError("");
		setMapFocus("search");
	};

	const handlePlaceLookup = async () => {
		const trimmedQuery = placeQuery.trim();
		if (trimmedQuery.length < 2) {
			setPlaceSearchError("Enter at least 2 characters.");
			setPlaceResults([]);
			return;
		}
		setIsSearchingPlaces(true);
		setPlaceSearchError("");
		try {
			const results = await searchPlaces(trimmedQuery, 8);
			setPlaceResults(results);
			if (!results.length) {
				setActiveSearchPlace(null);
				setNavigationRoutes({});
				setSelectedRouteId(null);
				setPlaceSearchError("No matching location found.");
				return;
			}
			handleSelectPlace(results[0]);
		} catch (error) {
			setPlaceResults([]);
			setPlaceSearchError(
				error instanceof Error ? error.message : "Search unavailable.",
			);
		} finally {
			setIsSearchingPlaces(false);
		}
	};

	const handleAddComparePlace = (place: PlaceSearchResult) => {
		addComparePlace(place);
	};

	const handleNearestCleanZone = () => {
		if (!userLocation) return;
		setGreenDestination(getNearestCleanZone(userLocation));
		setMapFocus("green");
	};

	const handleRegionChange = (regionId: string) => {
		const region = availableRegions.find((r) => r.id === regionId);
		if (region) setSelectedRegion(region);
	};

	const localSummary =
		localEnvironment?.summary ?? "Air quality data loading...";
	const localFeedStatus = localEnvironmentQuery.isLoading
		? "Refreshing live feed..."
		: localEnvironmentQuery.error
			? "Live feed unavailable."
			: `Updated ${formatUpdatedTime(localEnvironment)} | ${localEnvironment?.weatherLabel ?? "Loading..."}`;

	return (
		<>
			{isCollapsed && (
				<motion.button
					initial={{ opacity: 0, y: 20 }}
					animate={{ opacity: 1, y: 0 }}
					type="button"
					onClick={() => setIsCollapsed(false)}
					className="pointer-events-auto absolute bottom-4 left-4 z-30 flex h-20 w-[460px] cursor-pointer items-center gap-4 overflow-hidden rounded-2xl border border-white/10 bg-[#09090b]/90 px-4 shadow-xl backdrop-blur-2xl transition-colors hover:bg-[#09090b] md:left-4"
					title="Expand Environmental Command OS"
				>
					<div
						className={`flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-gradient-to-br ${bandStyles.bg}`}
					>
						<Leaf className="h-6 w-6 text-white" />
					</div>
					<div className="flex-1 text-left">
						<p className={`text-2xl font-black ${bandStyles.text}`}>
							{Math.round(aqiValue)}
						</p>
						<p className="text-xs text-zinc-400">{selectedRegion.name}</p>
					</div>
					<div className="flex flex-col gap-1 text-right">
						<span
							className={`rounded px-2 py-0.5 text-[10px] font-semibold ${bandStyles.badge}`}
						>
							{meta.label}
						</span>
						<span className="text-[10px] text-zinc-500">
							PM2.5 {formatReading(localEnvironment?.pm25 ?? 22, 1)}
						</span>
					</div>
					<ChevronDown className="h-5 w-5 shrink-0 text-zinc-400" />
				</motion.button>
			)}

			{!isCollapsed && (
				<motion.div
					initial={{ opacity: 0, y: 50 }}
					animate={{ opacity: 1, y: 0 }}
					transition={{ duration: 0.5, ease: "easeOut" }}
					className="pointer-events-auto absolute bottom-4 left-4 right-4 overflow-y-auto rounded-3xl border border-white/10 bg-[#09090b]/85 p-5 text-white shadow-2xl backdrop-blur-2xl md:left-auto md:right-4 md:bottom-4 md:w-[460px] max-h-[calc(100vh-2rem)] panel-glass"
				>
					<div className="pointer-events-none absolute inset-x-0 -top-24 h-48 bg-gradient-to-b from-white/5 to-transparent blur-2xl" />

					{dbUser && (
						<div className="relative z-10 mb-4 flex items-center justify-between rounded-xl border border-white/5 bg-white/5 p-3">
							<div className="flex items-center gap-2">
								<Shield className="h-4 w-4 text-emerald-400" />
								<span className="text-sm font-bold">
									Eco-Warrior Lv.{dbUser.level || 1}
								</span>
								<span className="text-xs text-zinc-400">
									{dbUser.xp || 0} XP
								</span>
							</div>
							{!isCleaning ? (
								<button
									type="button"
									onClick={() => setIsCleaning(true)}
									className="flex cursor-pointer items-center gap-1.5 rounded-lg bg-emerald-500 px-3 py-1.5 text-xs font-bold text-black transition-colors hover:bg-emerald-400"
								>
									<Play className="h-3 w-3" />
									Mission
								</button>
							) : (
								<button
									type="button"
									onClick={async () => {
										setIsCleaning(false);
										if (user && userLocation) {
											const id = await completeCleanup({
												clerkId: user.id,
												lat: userLocation[1],
												lng: userLocation[0],
												xpAwarded: 50,
											});
											setCleanupId(id as Id<"cleanups">);
											setShowPulseCheck(true);
										}
									}}
									className="flex cursor-pointer items-center gap-1.5 rounded-lg bg-red-500 px-3 py-1.5 text-xs font-bold text-white transition-colors hover:bg-red-400"
								>
									<Square className="h-3 w-3" />
									End
								</button>
							)}
						</div>
					)}

					<div className="relative z-10 mb-4 flex items-center justify-between">
						<div className="flex items-center gap-3">
							<div
								className={`rounded-xl bg-gradient-to-br p-2.5 ${bandStyles.bg}`}
							>
								<Leaf className="h-5 w-5 text-white" />
							</div>
							<div>
								<div className="flex items-center gap-2">
									<h2 className="text-lg font-bold tracking-tight">
										Environmental Command OS
									</h2>
									<LiveIndicator />
								</div>
								<div className="flex items-center gap-2">
									<Globe className="h-3 w-3 text-zinc-500" />
									<select
										value={selectedRegion.id}
										onChange={(e) => handleRegionChange(e.target.value)}
										className="cursor-pointer bg-transparent text-xs text-zinc-400 outline-none hover:text-zinc-300"
									>
										<option value="auto">My Location (Auto)</option>
										<optgroup label="India">
											{availableRegions
												.filter((r) => r.country === "India")
												.map((r) => (
													<option key={r.id} value={r.id}>
														{r.name}
													</option>
												))}
										</optgroup>
										<optgroup label="China">
											{availableRegions
												.filter((r) => r.country === "China")
												.map((r) => (
													<option key={r.id} value={r.id}>
														{r.name}
													</option>
												))}
										</optgroup>
										<optgroup label="Europe">
											{availableRegions
												.filter((r) =>
													[
														"UK",
														"France",
														"Germany",
														"Spain",
														"Italy",
														"Netherlands",
														"Sweden",
													].includes(r.country),
												)
												.map((r) => (
													<option key={r.id} value={r.id}>
														{r.name}
													</option>
												))}
										</optgroup>
										<optgroup label="Americas">
											{availableRegions
												.filter((r) => ["USA", "Canada"].includes(r.country))
												.map((r) => (
													<option key={r.id} value={r.id}>
														{r.name}
													</option>
												))}
										</optgroup>
										<optgroup label="Asia Pacific">
											{availableRegions
												.filter((r) =>
													[
														"Japan",
														"South Korea",
														"Singapore",
														"Australia",
													].includes(r.country),
												)
												.map((r) => (
													<option key={r.id} value={r.id}>
														{r.name}
													</option>
												))}
										</optgroup>
									</select>
								</div>
							</div>
						</div>
						<button
							type="button"
							onClick={() => localEnvironmentQuery.refetch()}
							className="rounded-lg p-2 text-zinc-400 transition-colors hover:bg-white/10 hover:text-white"
							title="Refresh data"
						>
							<RefreshCw
								className={`h-4 w-4 ${localEnvironmentQuery.isFetching ? "animate-spin" : ""}`}
							/>
						</button>
						<button
							type="button"
							onClick={() => setIsCollapsed(true)}
							className="cursor-pointer rounded-lg p-2 text-zinc-400 transition-colors hover:bg-white/10 hover:text-white"
							title="Minimize panel"
						>
							<ChevronUp className="h-4 w-4" />
						</button>
					</div>

					<div className="relative z-10 mb-4 rounded-xl border border-white/10 bg-gradient-to-r p-4 from-white/5 to-transparent">
						<div className="flex items-center gap-4">
							<AqiGauge value={aqiValue} band={band} />
							<div className="flex-1">
								<span
									className={`inline-block rounded-full px-2.5 py-1 text-xs font-semibold ${bandStyles.badge}`}
								>
									{meta.label}
								</span>
								<p className="mt-2 text-xs text-zinc-400">{localFeedStatus}</p>
								{calculations && (
									<div className="mt-2 flex items-center gap-3 text-[10px]">
										<span className="text-zinc-500">
											<span className="text-emerald-400">
												{calculations.cityComparison.percentBetter}%
											</span>{" "}
											better than city avg
										</span>
										<span
											className={`flex items-center gap-0.5 ${calculations.trendPercent > 0 ? "text-emerald-400" : "text-red-400"}`}
										>
											{calculations.trendPercent > 0 ? (
												<TrendingDown className="h-3 w-3" />
											) : (
												<TrendingUp className="h-3 w-3" />
											)}
											{Math.abs(calculations.trendPercent)}%
										</span>
									</div>
								)}
							</div>
						</div>
					</div>

					<div className="relative z-10 grid grid-cols-2 gap-2 sm:grid-cols-3">
						<div className="rounded-xl border border-white/10 bg-white/5 p-3 transition-all hover:bg-white/10">
							<div className="flex items-center gap-2">
								<div
									className={`flex h-8 w-8 items-center justify-center rounded-lg ${bandStyles.bg}`}
								>
									<Wind className="h-4 w-4 text-white" />
								</div>
								<div>
									<p className="text-[10px] uppercase tracking-wider text-zinc-500">
										AQI
									</p>
									<p className={`text-lg font-bold ${bandStyles.text}`}>
										{Math.round(aqiValue)}
									</p>
								</div>
							</div>
						</div>
						<div className="rounded-xl border border-white/10 bg-white/5 p-3 transition-all hover:bg-white/10">
							<div className="flex items-center gap-2">
								<div className="flex h-8 w-8 items-center justify-center rounded-lg bg-amber-500/15">
									<Activity className="h-4 w-4 text-amber-400" />
								</div>
								<div>
									<p className="text-[10px] uppercase tracking-wider text-zinc-500">
										PM2.5
									</p>
									<p className="text-lg font-bold text-amber-400">
										{formatReading(localEnvironment?.pm25 ?? 22, 1)}
									</p>
								</div>
							</div>
						</div>
						<div className="rounded-xl border border-white/10 bg-white/5 p-3 transition-all hover:bg-white/10">
							<div className="flex items-center gap-2">
								<div className="flex h-8 w-8 items-center justify-center rounded-lg bg-orange-500/15">
									<Thermometer className="h-4 w-4 text-orange-400" />
								</div>
								<div>
									<p className="text-[10px] uppercase tracking-wider text-zinc-500">
										Temp
									</p>
									<p className="text-lg font-bold text-orange-400">
										{formatReading(localEnvironment?.temperature ?? 25, 1)}C
									</p>
								</div>
							</div>
						</div>
						<div className="rounded-xl border border-white/10 bg-white/5 p-3 transition-all hover:bg-white/10">
							<div className="flex items-center gap-2">
								<div className="flex h-8 w-8 items-center justify-center rounded-lg bg-blue-500/15">
									<Droplets className="h-4 w-4 text-blue-400" />
								</div>
								<div>
									<p className="text-[10px] uppercase tracking-wider text-zinc-500">
										Humidity
									</p>
									<p className="text-lg font-bold text-blue-400">
										{formatReading(localEnvironment?.humidity ?? 50)}%
									</p>
								</div>
							</div>
						</div>
						<div className="rounded-xl border border-white/10 bg-white/5 p-3 transition-all hover:bg-white/10">
							<div className="flex items-center gap-2">
								<div className="flex h-8 w-8 items-center justify-center rounded-lg bg-cyan-500/15">
									<Car className="h-4 w-4 text-cyan-400" />
								</div>
								<div>
									<p className="text-[10px] uppercase tracking-wider text-zinc-500">
										Wind
									</p>
									<p className="text-lg font-bold text-cyan-400">
										{formatReading(localEnvironment?.windSpeed ?? 5)} km/h
									</p>
								</div>
							</div>
						</div>
						<div className="rounded-xl border border-white/10 bg-white/5 p-3 transition-all hover:bg-white/10">
							<div className="flex items-center gap-2">
								<div className="flex h-8 w-8 items-center justify-center rounded-lg bg-yellow-500/15">
									<Sun className="h-4 w-4 text-yellow-400" />
								</div>
								<div>
									<p className="text-[10px] uppercase tracking-wider text-zinc-500">
										UV Index
									</p>
									<p className="text-lg font-bold text-yellow-400">
										{formatReading(localEnvironment?.uvIndex ?? 5, 1)}
									</p>
								</div>
							</div>
						</div>
					</div>

					{calculations && (
						<div className="relative z-10 mt-4 grid grid-cols-2 gap-2">
							<div className="rounded-xl border border-emerald-500/20 bg-gradient-to-r from-emerald-500/10 to-transparent p-3">
								<div className="flex items-center gap-1.5 text-[10px] uppercase tracking-wider text-emerald-200/70">
									<Leaf className="h-3 w-3" />
									Best Time Outside
								</div>
								<p className="mt-1 text-sm font-bold text-emerald-400">
									{calculations.bestTimeToGoOut?.start ?? "6:00 AM"}
								</p>
								<p className="text-[10px] text-zinc-500">
									{calculations.bestTimeToGoOut
										? `AQI: ${calculations.bestTimeToGoOut.aqi}`
										: "Morning hours"}
								</p>
							</div>
							<div className="rounded-xl border border-amber-500/20 bg-gradient-to-r from-amber-500/10 to-transparent p-3">
								<div className="flex items-center gap-1.5 text-[10px] uppercase tracking-wider text-amber-200/70">
									<Heart className="h-3 w-3" />
									Health Score
								</div>
								<p className="mt-1 text-sm font-bold text-amber-400">
									{calculations.healthScore}/100
								</p>
								<p className="text-[10px] text-zinc-500">
									{calculations.healthScore > 70
										? "Good"
										: calculations.healthScore > 40
											? "Moderate"
											: "Poor"}
								</p>
							</div>
							<div className="rounded-xl border border-red-500/20 bg-gradient-to-r from-red-500/10 to-transparent p-3">
								<div className="flex items-center gap-1.5 text-[10px] uppercase tracking-wider text-red-200/70">
									<Activity className="h-3 w-3" />
									Daily Dose
								</div>
								<p className="mt-1 text-sm font-bold text-red-400">
									{calculations.dailyExposureDose}mg
								</p>
								<p className="text-[10px] text-zinc-500">PM2.5 inhaled</p>
							</div>
							<div className="rounded-xl border border-purple-500/20 bg-gradient-to-r from-purple-500/10 to-transparent p-3">
								<div className="flex items-center gap-1.5 text-[10px] uppercase tracking-wider text-purple-200/70">
									<Filter className="h-3 w-3" />
									Main Pollutant
								</div>
								<p className="mt-1 text-sm font-bold text-purple-400 truncate">
									{calculations.dominantPollutant.split(" ")[0]}
								</p>
								<p className="text-[10px] text-zinc-500">
									{calculations.dominantPollutant.includes("Vehicle")
										? "Traffic"
										: calculations.dominantPollutant.includes("Dust")
											? "Dust"
											: "Industrial"}
								</p>
							</div>
						</div>
					)}

					<ExpandableSection
						title="Hourly Forecast"
						icon={<BarChart3 className="h-4 w-4" />}
						isOpen={expandedSections.forecast}
						onToggle={() => toggleSection("forecast")}
					>
						{hourlyQuery.data && hourlyQuery.data.length > 0 ? (
							<HourlyChart data={hourlyQuery.data} />
						) : (
							<div className="flex items-center justify-center py-4 text-sm text-zinc-500">
								<RefreshCw
									className={`h-4 w-4 mr-2 ${hourlyQuery.isFetching ? "animate-spin" : ""}`}
								/>
								Loading forecast...
							</div>
						)}
					</ExpandableSection>

					<ExpandableSection
						title="Pollutants Breakdown"
						icon={<Filter className="h-4 w-4" />}
						isOpen={expandedSections.pollutants}
						onToggle={() => toggleSection("pollutants")}
					>
						<div className="grid grid-cols-2 gap-2">
							{[
								{
									label: "PM2.5",
									value: localEnvironment?.pm25,
									unit: "ug/m3",
								},
								{ label: "PM10", value: localEnvironment?.pm10, unit: "ug/m3" },
								{
									label: "NO2",
									value: localEnvironment?.nitrogenDioxide,
									unit: "ug/m3",
								},
								{ label: "O3", value: localEnvironment?.ozone, unit: "ug/m3" },
								{
									label: "SO2",
									value: localEnvironment?.sulphurDioxide,
									unit: "ug/m3",
								},
								{
									label: "CO",
									value: localEnvironment?.carbonMonoxide,
									unit: "mg/m3",
								},
								{ label: "Dust", value: localEnvironment?.dust, unit: "ug/m3" },
								{
									label: "Pressure",
									value: localEnvironment?.pressure,
									unit: "hPa",
								},
							].map((item) => (
								<div
									key={item.label}
									className="rounded-lg border border-white/5 bg-black/20 p-2"
								>
									<p className="text-[10px] uppercase tracking-wider text-zinc-500">
										{item.label}
									</p>
									<p className="text-sm font-semibold text-white">
										{formatReading(item.value ?? undefined, 1)}{" "}
										<span className="text-[10px] text-zinc-500">
											{item.unit}
										</span>
									</p>
								</div>
							))}
						</div>
					</ExpandableSection>

					<ExpandableSection
						title="Safety Recommendations"
						icon={<Shield className="h-4 w-4" />}
						isOpen={expandedSections.recommendations}
						onToggle={() => toggleSection("recommendations")}
					>
						<div className="space-y-2">
							{(
								localEnvironment?.safetyMeasures ?? [
									"Keep windows closed during high-traffic hours.",
									"Use air purifier indoors if available.",
								]
							).map((measure, i) => (
								<div
									key={i}
									className="flex items-start gap-2 rounded-lg border border-white/5 bg-black/20 p-2"
								>
									<CheckCircle2 className="mt-0.5 h-3.5 w-3.5 shrink-0 text-emerald-400" />
									<p className="text-xs text-zinc-300">{measure}</p>
								</div>
							))}
						</div>
					</ExpandableSection>

					<div className="relative z-10 mt-4 rounded-xl border border-white/10 bg-white/5 p-4">
						<div className="mb-3 flex items-center gap-2">
							<Search className="h-4 w-4 text-emerald-400" />
							<span className="text-sm font-semibold">
								Zone Intelligence Query
							</span>
						</div>
						<div className="flex gap-2">
							<Input
								value={placeQuery}
								onChange={(e) => setPlaceQuery(e.target.value)}
								onKeyDown={(e) => {
									if (e.key === "Enter") void handlePlaceLookup();
								}}
								placeholder="Search any city or area"
								className="h-10 flex-1 border-white/10 bg-black/30 text-sm text-white placeholder:text-zinc-500"
							/>
							<button
								type="button"
								onClick={() => void handlePlaceLookup()}
								className="shrink-0 rounded-xl bg-emerald-500 px-4 text-sm font-bold text-black transition-colors hover:bg-emerald-400"
							>
								{isSearchingPlaces ? "..." : "Query"}
							</button>
						</div>
						{placeSearchError && (
							<p className="mt-2 text-xs text-amber-300">{placeSearchError}</p>
						)}
						{placeResults.length > 0 && (
							<div className="mt-3 space-y-2">
								{placeResults.slice(0, 5).map((result) => {
									const isCompared = comparePlaces.some(
										(p) => p.id === result.id,
									);
									return (
										<div
											key={result.id}
											className="flex items-center justify-between rounded-lg border border-white/10 bg-black/20 p-2"
										>
											<button
												type="button"
												onClick={() => handleSelectPlace(result)}
												className="flex-1 text-left"
											>
												<p className="text-sm font-medium">{result.label}</p>
												<p className="text-[10px] text-zinc-500">
													{result.country}
												</p>
											</button>
											<button
												type="button"
												onClick={() => handleAddComparePlace(result)}
												disabled={isCompared}
												className="ml-2 rounded-lg border border-white/10 px-2 py-1 text-[10px] font-medium text-zinc-300 hover:bg-white/5 disabled:opacity-50"
											>
												{isCompared ? "Added" : "Compare"}
											</button>
										</div>
									);
								})}
							</div>
						)}
					</div>

					<button
						type="button"
						onClick={handleNearestCleanZone}
						className="relative z-10 mt-3 flex w-full cursor-pointer items-center justify-between rounded-xl border border-emerald-500/30 bg-gradient-to-r from-emerald-500/10 to-transparent px-4 py-3 text-sm font-bold text-emerald-400 transition-all hover:border-emerald-500/60 hover:from-emerald-500/20"
					>
						<div className="flex items-center gap-2">
							<Leaf className="h-4 w-4" />
							<span>
								{greenDestination
									? "Refresh Clean Zone"
									: "Optimal Airflow Corridor"}
							</span>
						</div>
						<ChevronRight className="h-4 w-4" />
					</button>

					{greenDestination && (
						<div className="relative z-10 mt-2 rounded-xl border border-emerald-500/25 bg-emerald-500/10 p-3">
							<div className="flex items-center justify-between">
								<span className="text-xs uppercase tracking-wider text-emerald-200/70">
									Nearest Clean Zone
								</span>
								<span className="text-xs font-medium text-emerald-300">
									{greenDestination.distanceKm.toFixed(1)} km
								</span>
							</div>
							<h3 className="mt-1 font-bold text-white">
								{greenDestination.name}
							</h3>
							<p className="mt-1 text-xs text-zinc-400">
								{greenDestination.note}
							</p>
						</div>
					)}

					{localEnvironment?.aqi && localEnvironment.aqi > 100 && (
						<div className="relative z-10 mt-3 rounded-xl border-l-4 border-red-500 bg-gradient-to-r from-red-500/10 to-transparent p-3">
							<div className="flex items-center gap-2">
								<TriangleAlert className="h-4 w-4 text-red-400" />
								<span className="font-semibold text-red-400">
									Environmental Threat Detected
								</span>
							</div>
							<p className="mt-1 text-xs text-zinc-400">{localSummary}</p>
						</div>
					)}
				</motion.div>
			)}

			<AnimatePresence>
				{showPulseCheck && (
					<motion.div
						initial={{ opacity: 0, scale: 0.95 }}
						animate={{ opacity: 1, scale: 1 }}
						exit={{ opacity: 0, scale: 0.95 }}
						className="pointer-events-auto absolute bottom-4 left-4 z-50 w-[400px] rounded-3xl border border-white/10 bg-[#0c0c0e]/95 p-6 text-white shadow-2xl backdrop-blur-3xl"
					>
						<div className="mb-6 flex items-center gap-3">
							<div className="flex h-10 w-10 items-center justify-center rounded-full bg-emerald-500/20">
								<CheckCircle2 className="h-5 w-5 text-emerald-400" />
							</div>
							<div>
								<h3 className="text-lg font-bold">Mission Complete!</h3>
								<p className="text-xs font-medium text-emerald-400">
									+50 XP Earned
								</p>
							</div>
						</div>
						<div className="space-y-4">
							<div>
								<label
									htmlFor="pulse-safety"
									className="mb-2 block text-xs font-bold text-zinc-400"
								>
									1. How safe did you feel?
								</label>
								<input
									id="pulse-safety"
									type="range"
									min="1"
									max="10"
									value={questions.safety}
									onChange={(e) =>
										setQuestions((q) => ({
											...q,
											safety: Number.parseInt(e.target.value),
										}))
									}
									className="mb-1 w-full accent-emerald-500"
								/>
								<div className="flex justify-between text-[10px] text-zinc-500">
									<span>Unsafe</span>
									<span>Very Safe</span>
								</div>
							</div>
							<div>
								<label
									htmlFor="pulse-comments"
									className="mb-2 block text-xs font-bold text-zinc-400"
								>
									2. Comments (optional)
								</label>
								<textarea
									id="pulse-comments"
									value={questions.comments}
									onChange={(e) =>
										setQuestions((q) => ({ ...q, comments: e.target.value }))
									}
									className="w-full resize-none rounded-xl border border-white/10 bg-black/50 p-3 text-sm text-zinc-200"
									rows={2}
									placeholder="Any feedback..."
								/>
							</div>
						</div>
						<button
							type="button"
							onClick={async () => {
								if (user && cleanupId) {
									await submitSurvey({
										clerkId: user.id,
										cleanupId,
										safetyRating: questions.safety,
										accuracyRating: questions.accuracy,
										comments: questions.comments,
									});
								}
								setShowPulseCheck(false);
								setQuestions({ safety: 5, accuracy: 5, comments: "" });
							}}
							className="mt-4 w-full cursor-pointer rounded-xl bg-white py-3 text-sm font-bold text-black transition-colors hover:bg-zinc-200"
						>
							Submit Pulse Check
						</button>
					</motion.div>
				)}
			</AnimatePresence>
		</>
	);
}
