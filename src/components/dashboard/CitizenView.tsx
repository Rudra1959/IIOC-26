import { useUser } from "@clerk/clerk-react";
import {
	useQueries,
	useQuery as useTanstackQuery,
} from "@tanstack/react-query";
import { useQuery as useConvexQuery, useMutation } from "convex/react";
import { AnimatePresence, motion } from "framer-motion";
import {
	Activity,
	CheckCircle2,
	ChevronRight,
	Crosshair,
	Droplets,
	Info,
	Map as MapIcon,
	MapPin,
	Play,
	Plus,
	Search,
	Shield,
	Square,
	Star,
	Sun,
	Trash2,
	Wind,
	X,
} from "lucide-react";
import { useMemo, useState } from "react";
import { api } from "../../../convex/_generated/api";
import type { Id } from "../../../convex/_generated/dataModel";
import { type AqiBand, getNearestCleanZone } from "../../lib/air-quality";
import {
	type EnvironmentalSnapshot,
	fetchEnvironmentalSnapshot,
	type PlaceSearchResult,
	searchPlaces,
} from "../../lib/environment";
import { useEnvStore } from "../../store/envStore";
import { Input } from "../ui/input";

const aqiBandStyles: Record<AqiBand, { text: string; badge: string }> = {
	good: {
		text: "text-emerald-400",
		badge: "bg-emerald-500/15 text-emerald-300 border border-emerald-500/30",
	},
	moderate: {
		text: "text-yellow-300",
		badge: "bg-yellow-500/15 text-yellow-200 border border-yellow-500/30",
	},
	"unhealthy-sensitive": {
		text: "text-orange-300",
		badge: "bg-orange-500/15 text-orange-200 border border-orange-500/30",
	},
	unhealthy: {
		text: "text-red-400",
		badge: "bg-red-500/15 text-red-300 border border-red-500/30",
	},
	"very-unhealthy": {
		text: "text-fuchsia-300",
		badge: "bg-fuchsia-500/15 text-fuchsia-200 border border-fuchsia-500/30",
	},
	hazardous: {
		text: "text-rose-300",
		badge: "bg-rose-500/15 text-rose-200 border border-rose-500/30",
	},
};

function normalizeUnit(unit: string | null | undefined) {
	if (!unit) return "";
	return unit
		.replace(/°/g, "deg ")
		.replace(/µ/g, "u")
		.replace(/³/g, "3")
		.trim();
}

function formatReading(value: number | null | undefined, digits = 0) {
	if (value == null) return "--";
	return value.toFixed(digits);
}

function formatReadingWithUnit(
	value: number | null | undefined,
	unit: string | null | undefined,
	digits = 0,
) {
	const formattedValue = formatReading(value, digits);
	if (formattedValue === "--") return formattedValue;
	const normalizedUnit = normalizeUnit(unit);
	return normalizedUnit
		? `${formattedValue} ${normalizedUnit}`
		: formattedValue;
}

function formatUpdatedTime(snapshot: EnvironmentalSnapshot | undefined) {
	if (!snapshot?.updatedAt) return "Waiting for live sensor feed";
	const date = new Date(snapshot.updatedAt);
	if (Number.isNaN(date.getTime())) return snapshot.updatedAt;
	return date.toLocaleTimeString([], { hour: "numeric", minute: "2-digit" });
}

function getSnapshotHighlights(snapshot: EnvironmentalSnapshot) {
	return [
		{
			label: "Temperature",
			value: formatReadingWithUnit(
				snapshot.temperature,
				snapshot.units.temperature,
				1,
			),
		},
		{
			label: "Humidity",
			value: formatReadingWithUnit(snapshot.humidity, snapshot.units.humidity),
		},
		{
			label: "Wind",
			value: formatReadingWithUnit(
				snapshot.windSpeed,
				snapshot.units.windSpeed,
			),
		},
		{
			label: "UV Index",
			value: formatReadingWithUnit(snapshot.uvIndex, snapshot.units.uvIndex, 1),
		},
	];
}

function getSnapshotPollutants(snapshot: EnvironmentalSnapshot) {
	return [
		{
			label: "PM2.5",
			value: formatReadingWithUnit(snapshot.pm25, snapshot.units.pm25, 1),
		},
		{
			label: "PM10",
			value: formatReadingWithUnit(snapshot.pm10, snapshot.units.pm10, 1),
		},
		{
			label: "NO2",
			value: formatReadingWithUnit(
				snapshot.nitrogenDioxide,
				snapshot.units.nitrogenDioxide,
				1,
			),
		},
		{
			label: "O3",
			value: formatReadingWithUnit(snapshot.ozone, snapshot.units.ozone, 1),
		},
		{
			label: "SO2",
			value: formatReadingWithUnit(
				snapshot.sulphurDioxide,
				snapshot.units.sulphurDioxide,
				1,
			),
		},
		{
			label: "CO",
			value: formatReadingWithUnit(
				snapshot.carbonMonoxide,
				snapshot.units.carbonMonoxide,
				1,
			),
		},
		{
			label: "Dust",
			value: formatReadingWithUnit(snapshot.dust, snapshot.units.dust, 1),
		},
		{
			label: "Pressure",
			value: formatReadingWithUnit(
				snapshot.pressure,
				snapshot.units.pressure,
				0,
			),
		},
	];
}

function QuickPlaceRail({
	title,
	places,
	onSelect,
	onToggleFavorite,
	favoriteIds,
}: {
	title: string;
	places: PlaceSearchResult[];
	onSelect: (place: PlaceSearchResult) => void;
	onToggleFavorite: (place: PlaceSearchResult) => void;
	favoriteIds: Set<string>;
}) {
	if (!places.length) return null;

	return (
		<div className="mt-3">
			<p className="mb-2 text-[11px] uppercase tracking-[0.2em] text-zinc-500">
				{title}
			</p>
			<div className="flex gap-2 overflow-x-auto pb-1">
				{places.map((place) => (
					<div
						key={`${title}-${place.id}`}
						className="min-w-[180px] rounded-xl border border-white/10 bg-black/20 p-3"
					>
						<button
							type="button"
							onClick={() => onSelect(place)}
							className="w-full text-left"
						>
							<p className="text-sm font-semibold text-white leading-tight">
								{place.label}
							</p>
						</button>
						<div className="mt-2 flex items-center justify-between gap-2">
							<span className="text-[11px] text-zinc-500">Quick access</span>
							<button
								type="button"
								onClick={() => onToggleFavorite(place)}
								className={`rounded-lg p-1.5 transition-colors ${favoriteIds.has(place.id) ? "bg-amber-500/15 text-amber-300" : "text-zinc-500 hover:bg-white/5 hover:text-white"}`}
							>
								<Star className="h-3.5 w-3.5" />
							</button>
						</div>
					</div>
				))}
			</div>
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
	const activeSearchPlace = useEnvStore((s) => s.activeSearchPlace);
	const setActiveSearchPlace = useEnvStore((s) => s.setActiveSearchPlace);
	const comparePlaces = useEnvStore((s) => s.comparePlaces);
	const addComparePlace = useEnvStore((s) => s.addComparePlace);
	const removeComparePlace = useEnvStore((s) => s.removeComparePlace);
	const clearComparePlaces = useEnvStore((s) => s.clearComparePlaces);
	const favoritePlaces = useEnvStore((s) => s.favoritePlaces);
	const addFavoritePlace = useEnvStore((s) => s.addFavoritePlace);
	const removeFavoritePlace = useEnvStore((s) => s.removeFavoritePlace);
	const recentSearches = useEnvStore((s) => s.recentSearches);
	const addRecentSearch = useEnvStore((s) => s.addRecentSearch);
	const setMapFocus = useEnvStore((s) => s.setMapFocus);

	const [activeMetric, setActiveMetric] = useState<string | null>(null);
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

	const favoriteIds = useMemo(
		() => new Set(favoritePlaces.map((place) => place.id)),
		[favoritePlaces],
	);
	const localEnvironmentQuery = useTanstackQuery({
		queryKey: ["environment", "local", userLocation?.[0], userLocation?.[1]],
		enabled: Boolean(userLocation),
		staleTime: 2 * 60 * 1000,
		gcTime: 15 * 60 * 1000,
		retry: 1,
		refetchOnWindowFocus: false,
		queryFn: () => {
			if (!userLocation) {
				throw new Error("User location is unavailable.");
			}

			return fetchEnvironmentalSnapshot({
				latitude: userLocation[1],
				longitude: userLocation[0],
				label: "Current location",
			});
		},
	});

	const searchedEnvironmentQuery = useTanstackQuery({
		queryKey: ["environment", "search", activeSearchPlace?.id],
		enabled: Boolean(activeSearchPlace),
		staleTime: 2 * 60 * 1000,
		gcTime: 15 * 60 * 1000,
		retry: 1,
		refetchOnWindowFocus: false,
		queryFn: () => {
			if (!activeSearchPlace) {
				throw new Error("Search target is unavailable.");
			}

			return fetchEnvironmentalSnapshot({
				latitude: activeSearchPlace.latitude,
				longitude: activeSearchPlace.longitude,
				label: activeSearchPlace.label,
				timezone: activeSearchPlace.timezone,
			});
		},
	});

	const compareEnvironmentQueries = useQueries({
		queries: comparePlaces.map((place) => ({
			queryKey: ["environment", "compare", place.id],
			queryFn: () =>
				fetchEnvironmentalSnapshot({
					latitude: place.latitude,
					longitude: place.longitude,
					label: place.label,
					timezone: place.timezone,
				}),
			staleTime: 5 * 60 * 1000,
			gcTime: 15 * 60 * 1000,
			retry: 1,
			refetchOnWindowFocus: false,
		})),
	});

	const localEnvironment = localEnvironmentQuery.data;
	const searchedEnvironment = searchedEnvironmentQuery.data;
	const isActivePlaceCompared = Boolean(
		activeSearchPlace &&
			comparePlaces.some((place) => place.id === activeSearchPlace.id),
	);
	const isActivePlaceFavorite = Boolean(
		activeSearchPlace && favoriteIds.has(activeSearchPlace.id),
	);
	const metrics = useMemo(
		() => [
			{
				id: "aqi",
				title: "Air Quality (AQI)",
				value:
					localEnvironment?.aqi != null
						? String(Math.round(localEnvironment.aqi))
						: "84",
				unit: "",
				icon: Wind,
				color: "text-red-500",
				bg: "bg-red-500/10",
			},
			{
				id: "humidity",
				title: "Humidity",
				value: formatReading(localEnvironment?.humidity ?? 68),
				unit: normalizeUnit(localEnvironment?.units.humidity ?? "%"),
				icon: Droplets,
				color: "text-blue-400",
				bg: "bg-blue-500/10",
			},
			{
				id: "uv",
				title: "UV Index",
				value: formatReading(localEnvironment?.uvIndex ?? 8, 1),
				unit: "",
				icon: Sun,
				color: "text-yellow-400",
				bg: "bg-yellow-500/10",
			},
			{
				id: "pm25",
				title: "PM2.5",
				value: formatReading(localEnvironment?.pm25 ?? 22, 1),
				unit: normalizeUnit(localEnvironment?.units.pm25 ?? "ug/m3"),
				icon: Activity,
				color: "text-amber-500",
				bg: "bg-amber-500/10",
			},
		],
		[localEnvironment],
	);

	const localSafetyMeasures = localEnvironment?.safetyMeasures ?? [
		"Keep windows closed during high-traffic hours and use a fan or air purifier indoors.",
		"Carry water and reduce strenuous exercise until the air clears.",
	];
	const trendBars = useMemo(
		() =>
			Array.from({ length: 12 }, (_, index) => ({
				id: `trend-bar-${index + 1}`,
				height: `${20 + Math.random() * 80}%`,
				delay: index * 0.05,
			})),
		[],
	);

	const searchedHighlights = useMemo(
		() =>
			searchedEnvironment ? getSnapshotHighlights(searchedEnvironment) : [],
		[searchedEnvironment],
	);
	const searchedPollutants = useMemo(
		() =>
			searchedEnvironment ? getSnapshotPollutants(searchedEnvironment) : [],
		[searchedEnvironment],
	);
	const compareCards = comparePlaces.map((place, index) => ({
		place,
		query: compareEnvironmentQueries[index],
	}));

	const toggleFavoritePlace = (place: PlaceSearchResult) => {
		if (favoriteIds.has(place.id)) {
			removeFavoritePlace(place.id);
			return;
		}
		addFavoritePlace(place);
	};

	const handleSelectPlace = (place: PlaceSearchResult) => {
		setActiveSearchPlace(place);
		addRecentSearch(place);
		setPlaceQuery(place.label);
		setPlaceSearchError("");
		setMapFocus("search");
	};

	const handlePlaceLookup = async () => {
		const trimmedQuery = placeQuery.trim();
		if (trimmedQuery.length < 2) {
			setPlaceSearchError("Enter at least 2 characters to search for a place.");
			setPlaceResults([]);
			return;
		}

		setIsSearchingPlaces(true);
		setPlaceSearchError("");

		try {
			const results = await searchPlaces(trimmedQuery);
			setPlaceResults(results);
			if (!results.length) {
				setActiveSearchPlace(null);
				setPlaceSearchError(
					"No matching location found. Try a city, district, or landmark.",
				);
				return;
			}
			handleSelectPlace(results[0]);
		} catch (error) {
			setPlaceResults([]);
			setActiveSearchPlace(null);
			setPlaceSearchError(
				error instanceof Error
					? error.message
					: "Unable to reach the live location search right now.",
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

	const highlightedCleanZone = greenDestination?.name ?? "City Green Belt";
	const highlightedCleanZoneDistance =
		greenDestination?.distanceKm.toFixed(1) ?? "1.2";
	const localSummary =
		localEnvironment?.summary ??
		"Air quality has dropped below safe margins due to trapped urban heat and roadside buildup.";
	const localFeedStatus = localEnvironmentQuery.isLoading
		? "Refreshing live feed..."
		: localEnvironmentQuery.error
			? "Live feed unavailable, showing safe fallback values."
			: `Updated ${formatUpdatedTime(localEnvironment)} | ${localEnvironment?.weatherLabel ?? "Mixed conditions"}`;

	return (
		<>
			<motion.div
				initial={{ opacity: 0, y: 50 }}
				animate={{ opacity: 1, y: 0 }}
				transition={{ duration: 0.5, ease: "easeOut" }}
				className="pointer-events-auto absolute bottom-4 left-4 right-4 md:left-auto md:right-4 md:bottom-4 md:w-[440px] max-h-[calc(100vh-2rem)] overflow-y-auto rounded-3xl border border-white/10 bg-[#09090b]/60 p-6 text-white shadow-2xl backdrop-blur-3xl"
			>
				<div className="pointer-events-none absolute inset-x-0 -top-24 h-48 bg-gradient-to-b from-white/5 to-transparent blur-2xl" />

				{dbUser && (
					<div className="relative z-10 mb-6 flex items-center justify-between rounded-2xl border border-white/5 bg-white/5 p-4">
						<div>
							<div className="mb-1 flex items-center gap-2">
								<Shield className="h-4 w-4 text-emerald-400" />
								<h3 className="text-sm font-bold text-white">
									Eco-Warrior Level {dbUser.level || 1}
								</h3>
							</div>
							<div className="flex items-center gap-2 text-xs text-zinc-400">
								<Star className="h-3 w-3 text-amber-400" />
								<span>
									{dbUser.xp || 0} XP |{" "}
									{dbUser.badges?.[(dbUser.badges?.length ?? 1) - 1] || "Scout"}
								</span>
							</div>
						</div>

						{!isCleaning ? (
							<button
								type="button"
								onClick={() => setIsCleaning(true)}
								className="flex cursor-pointer items-center gap-2 rounded-xl bg-emerald-500 px-4 py-2 text-xs font-bold text-black transition-colors hover:bg-emerald-400"
							>
								<Play className="h-3 w-3" />
								Start Mission
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
								className="flex cursor-pointer items-center gap-2 rounded-xl bg-red-500 px-4 py-2 text-xs font-bold text-white transition-colors hover:bg-red-400"
							>
								<Square className="h-3 w-3" />
								End Mission
							</button>
						)}
					</div>
				)}

				<div className="relative z-10 mb-4 flex items-center justify-between">
					<div className="flex items-center gap-3">
						<div className="rounded-xl bg-gradient-to-br from-red-500 to-rose-600 p-2.5 text-white shadow-lg shadow-red-500/20">
							<MapPin className="h-5 w-5" />
						</div>
						<div>
							<h2 className="text-lg font-bold tracking-tight">
								Local Environment
							</h2>
							<p className="flex items-center gap-1 text-xs font-medium text-zinc-400">
								Hyper-local view | live weather + air chemistry
							</p>
						</div>
					</div>
					<button
						type="button"
						aria-label="Environment information"
						className="cursor-pointer rounded-full p-2 text-zinc-400 transition-colors hover:bg-white/10"
					>
						<Info className="h-5 w-5" />
					</button>
				</div>

				<div className="relative z-10 mb-4 rounded-2xl border border-white/10 bg-white/5 px-4 py-3">
					<div className="flex items-center justify-between gap-2">
						<div>
							<p className="text-[11px] uppercase tracking-[0.2em] text-zinc-500">
								Live local feed
							</p>
							<p className="mt-1 text-xs text-zinc-300">{localFeedStatus}</p>
						</div>
						<button
							type="button"
							onClick={() => setMapFocus("user")}
							className="rounded-xl border border-white/10 px-3 py-2 text-[11px] font-semibold text-zinc-300 transition-colors hover:bg-white/5"
						>
							My Area
						</button>
					</div>
				</div>

				<div className="relative z-10 mb-4 grid grid-cols-2 gap-3">
					{metrics.map((metric) => (
						<motion.button
							type="button"
							key={metric.id}
							whileHover={{ scale: 1.02 }}
							whileTap={{ scale: 0.98 }}
							onClick={() => setActiveMetric(metric.id)}
							className="group rounded-2xl border border-white/10 bg-white/5 p-4 text-left transition-colors hover:bg-white/10"
						>
							<div
								className={`mb-3 flex h-8 w-8 items-center justify-center rounded-lg ${metric.bg}`}
							>
								<metric.icon className={`h-4 w-4 ${metric.color}`} />
							</div>
							<p className="mb-1 text-xs font-medium text-zinc-400">
								{metric.title}
							</p>
							<div className="flex items-end gap-1">
								<span
									className={`text-2xl font-black tracking-tight ${metric.color}`}
								>
									{metric.value}
								</span>
								<span className="mb-1 text-[11px] font-bold text-zinc-500">
									{metric.unit}
								</span>
							</div>
						</motion.button>
					))}
				</div>
				<div className="relative z-10 mb-4 rounded-2xl border border-white/10 bg-white/5 p-4">
					<div className="mb-3 flex items-center justify-between gap-3">
						<div>
							<p className="text-sm font-bold text-white">
								Search live environmental data
							</p>
							<p className="text-xs text-zinc-400">
								AQI, PM2.5, PM10, gases, UV, weather, and more.
							</p>
						</div>
						<Search className="h-4 w-4 shrink-0 text-emerald-400" />
					</div>

					<div className="flex gap-2">
						<Input
							value={placeQuery}
							onChange={(event) => setPlaceQuery(event.target.value)}
							onKeyDown={(event) => {
								if (event.key === "Enter") void handlePlaceLookup();
							}}
							placeholder="Search city, district, or landmark"
							className="h-10 border-white/10 bg-black/30 text-white placeholder:text-zinc-500"
						/>
						<button
							type="button"
							onClick={() => void handlePlaceLookup()}
							className="shrink-0 rounded-xl bg-emerald-500 px-4 text-sm font-bold text-black transition-colors hover:bg-emerald-400"
						>
							{isSearchingPlaces ? "..." : "Search"}
						</button>
					</div>

					{placeSearchError && (
						<p className="mt-2 text-xs text-amber-300">{placeSearchError}</p>
					)}

					<QuickPlaceRail
						title="Favorites"
						places={favoritePlaces.slice(0, 6)}
						onSelect={handleSelectPlace}
						onToggleFavorite={toggleFavoritePlace}
						favoriteIds={favoriteIds}
					/>
					<QuickPlaceRail
						title="Recent"
						places={recentSearches.slice(0, 6)}
						onSelect={handleSelectPlace}
						onToggleFavorite={toggleFavoritePlace}
						favoriteIds={favoriteIds}
					/>

					{placeResults.length > 0 && (
						<div className="mt-3 grid gap-2">
							{placeResults.slice(0, 4).map((result) => {
								const isCompared = comparePlaces.some(
									(place) => place.id === result.id,
								);
								const isFavorite = favoriteIds.has(result.id);

								return (
									<div
										key={result.id}
										className={`rounded-xl border px-3 py-3 transition-colors ${activeSearchPlace?.id === result.id ? "border-sky-500/40 bg-sky-500/10" : "border-white/10 bg-black/20"}`}
									>
										<div className="flex items-start justify-between gap-3">
											<button
												type="button"
												onClick={() => handleSelectPlace(result)}
												className="flex-1 text-left"
											>
												<p className="text-sm font-semibold text-white">
													{result.label}
												</p>
												<p className="text-[11px] text-zinc-500">
													{result.latitude.toFixed(2)},{" "}
													{result.longitude.toFixed(2)}
												</p>
											</button>
											<div className="flex gap-2">
												<button
													type="button"
													onClick={() => toggleFavoritePlace(result)}
													className={`rounded-lg p-1.5 transition-colors ${isFavorite ? "bg-amber-500/15 text-amber-300" : "text-zinc-500 hover:bg-white/5 hover:text-white"}`}
												>
													<Star className="h-3.5 w-3.5" />
												</button>
												<button
													type="button"
													onClick={() => handleAddComparePlace(result)}
													disabled={isCompared}
													className="rounded-lg border border-white/10 px-2.5 py-1.5 text-[11px] font-semibold text-zinc-200 hover:bg-white/5 disabled:cursor-not-allowed disabled:opacity-50"
												>
													{isCompared ? "Added" : "Compare"}
												</button>
											</div>
										</div>
									</div>
								);
							})}
						</div>
					)}

					{activeSearchPlace && searchedEnvironmentQuery.isLoading && (
						<div className="mt-3 rounded-2xl border border-white/10 bg-black/30 p-4 text-sm text-zinc-300">
							Pulling live environment data for {activeSearchPlace.label}...
						</div>
					)}
					{searchedEnvironmentQuery.error && (
						<div className="mt-3 rounded-2xl border border-red-500/20 bg-red-500/10 p-4 text-sm text-red-200">
							{searchedEnvironmentQuery.error instanceof Error
								? searchedEnvironmentQuery.error.message
								: "Unable to load live environmental data for this place right now."}
						</div>
					)}

					{searchedEnvironment && activeSearchPlace && (
						<div className="mt-3 rounded-2xl border border-white/10 bg-black/30 p-4">
							<div className="mb-3 flex items-start justify-between gap-3">
								<div>
									<p className="text-xs uppercase tracking-[0.2em] text-zinc-500">
										Live snapshot
									</p>
									<h3 className="text-base font-bold text-white">
										{searchedEnvironment.label}
									</h3>
									<p className="text-[11px] text-zinc-500">
										Updated {formatUpdatedTime(searchedEnvironment)} |{" "}
										{searchedEnvironment.weatherLabel}
									</p>
								</div>
								<span
									className={`rounded-full px-2.5 py-1 text-[11px] font-semibold ${aqiBandStyles[searchedEnvironment.aqiBand].badge}`}
								>
									{searchedEnvironment.aqiLabel}
								</span>
							</div>

							<div className="mb-2 flex items-end gap-2">
								<span
									className={`text-3xl font-black ${aqiBandStyles[searchedEnvironment.aqiBand].text}`}
								>
									{searchedEnvironment.aqi != null
										? Math.round(searchedEnvironment.aqi)
										: "--"}
								</span>
								<span className="pb-1 text-xs text-zinc-500">AQI</span>
							</div>

							<p className="mb-4 text-xs leading-relaxed text-zinc-300">
								{searchedEnvironment.summary}
							</p>

							<div className="mb-4 flex flex-wrap gap-2">
								<button
									type="button"
									onClick={() => setMapFocus("search")}
									className="rounded-xl border border-sky-500/30 bg-sky-500/10 px-3 py-2 text-xs font-semibold text-sky-200 transition-colors hover:bg-sky-500/20"
								>
									<Crosshair className="mr-1 inline h-3.5 w-3.5" />
									Focus Map
								</button>
								<button
									type="button"
									onClick={() => handleAddComparePlace(activeSearchPlace)}
									disabled={isActivePlaceCompared}
									className="rounded-xl border border-white/10 px-3 py-2 text-xs font-semibold text-zinc-200 transition-colors hover:bg-white/5 disabled:cursor-not-allowed disabled:opacity-50"
								>
									<Plus className="mr-1 inline h-3.5 w-3.5" />
									{isActivePlaceCompared ? "In Compare" : "Add To Compare"}
								</button>
								<button
									type="button"
									onClick={() => toggleFavoritePlace(activeSearchPlace)}
									className={`rounded-xl border px-3 py-2 text-xs font-semibold transition-colors ${isActivePlaceFavorite ? "border-amber-500/30 bg-amber-500/10 text-amber-200" : "border-white/10 text-zinc-200 hover:bg-white/5"}`}
								>
									<Star className="mr-1 inline h-3.5 w-3.5" />
									{isActivePlaceFavorite ? "Favorited" : "Save Favorite"}
								</button>
							</div>

							<div className="mb-4 grid grid-cols-2 gap-2">
								{searchedHighlights.map((item) => (
									<div
										key={item.label}
										className="rounded-xl border border-white/10 bg-white/5 px-3 py-2"
									>
										<p className="text-[11px] uppercase tracking-[0.15em] text-zinc-500">
											{item.label}
										</p>
										<p className="mt-1 text-sm font-bold text-white">
											{item.value}
										</p>
									</div>
								))}
							</div>

							<div className="mb-4">
								<p className="mb-2 text-[11px] uppercase tracking-[0.2em] text-zinc-500">
									Air chemistry
								</p>
								<div className="grid grid-cols-2 gap-2">
									{searchedPollutants.map((item) => (
										<div
											key={item.label}
											className="rounded-xl border border-white/10 bg-white/5 px-3 py-2"
										>
											<p className="text-[11px] text-zinc-500">{item.label}</p>
											<p className="mt-1 text-sm font-semibold text-zinc-100">
												{item.value}
											</p>
										</div>
									))}
								</div>
							</div>

							<div>
								<p className="mb-2 text-[11px] uppercase tracking-[0.2em] text-zinc-500">
									Safety measures
								</p>
								<div className="grid gap-2">
									{searchedEnvironment.safetyMeasures.map((measure) => (
										<div
											key={measure}
											className="rounded-xl border border-white/10 bg-white/5 px-3 py-2 text-xs text-zinc-200"
										>
											{measure}
										</div>
									))}
								</div>
							</div>
						</div>
					)}
				</div>

				<div className="relative z-10 mb-4 rounded-2xl border border-amber-500/20 bg-amber-500/10 p-4">
					<div className="mb-3 flex items-center justify-between gap-3">
						<div>
							<p className="text-sm font-bold text-white">Compare Mode</p>
							<p className="text-xs text-zinc-400">
								View multiple places side by side and jump the map to any one.
							</p>
						</div>
						{comparePlaces.length > 0 && (
							<button
								type="button"
								onClick={clearComparePlaces}
								className="rounded-xl border border-white/10 px-3 py-2 text-[11px] font-semibold text-zinc-300 transition-colors hover:bg-white/5"
							>
								Clear
							</button>
						)}
					</div>

					{comparePlaces.length === 0 ? (
						<div className="rounded-2xl border border-white/10 bg-black/20 px-4 py-3 text-sm text-zinc-300">
							Add places from search results to build a side-by-side environment
							board.
						</div>
					) : (
						<div className="flex gap-3 overflow-x-auto pb-1">
							{compareCards.map(({ place, query }) => {
								const snapshot = query?.data;
								const aqiBadge = snapshot
									? aqiBandStyles[snapshot.aqiBand]
									: aqiBandStyles.moderate;
								return (
									<div
										key={place.id}
										className="min-w-[240px] rounded-2xl border border-white/10 bg-black/25 p-4"
									>
										<div className="mb-3 flex items-start justify-between gap-2">
											<div>
												<p className="text-sm font-bold leading-tight text-white">
													{place.label}
												</p>
												<p className="text-[11px] text-zinc-500">
													Compare target
												</p>
											</div>
											<button
												type="button"
												onClick={() => removeComparePlace(place.id)}
												className="rounded-lg p-1.5 text-zinc-500 transition-colors hover:bg-white/5 hover:text-white"
											>
												<Trash2 className="h-3.5 w-3.5" />
											</button>
										</div>

										<div className="mb-3 flex gap-2">
											<button
												type="button"
												onClick={() => handleSelectPlace(place)}
												className="rounded-xl border border-sky-500/30 bg-sky-500/10 px-3 py-2 text-[11px] font-semibold text-sky-200 transition-colors hover:bg-sky-500/20"
											>
												<Crosshair className="mr-1 inline h-3.5 w-3.5" />
												Focus
											</button>
											<button
												type="button"
												onClick={() => toggleFavoritePlace(place)}
												className={`rounded-xl border px-3 py-2 text-[11px] font-semibold transition-colors ${favoriteIds.has(place.id) ? "border-amber-500/30 bg-amber-500/10 text-amber-200" : "border-white/10 text-zinc-200 hover:bg-white/5"}`}
											>
												<Star className="mr-1 inline h-3.5 w-3.5" />
												Save
											</button>
										</div>

										{query?.isLoading && (
											<p className="text-sm text-zinc-300">
												Loading live data...
											</p>
										)}
										{query?.error && (
											<p className="text-sm text-red-200">
												Live comparison unavailable.
											</p>
										)}

										{snapshot && (
											<>
												<span
													className={`inline-flex rounded-full px-2.5 py-1 text-[11px] font-semibold ${aqiBadge.badge}`}
												>
													{snapshot.aqiLabel}
												</span>
												<div className="mt-3 flex items-end gap-2">
													<span
														className={`text-3xl font-black ${aqiBadge.text}`}
													>
														{snapshot.aqi != null
															? Math.round(snapshot.aqi)
															: "--"}
													</span>
													<span className="pb-1 text-xs text-zinc-500">
														AQI
													</span>
												</div>
												<div className="mt-3 grid grid-cols-2 gap-2 text-sm">
													<div className="rounded-xl border border-white/10 bg-white/5 px-3 py-2">
														<p className="text-[11px] text-zinc-500">Temp</p>
														<p className="font-semibold text-white">
															{formatReadingWithUnit(
																snapshot.temperature,
																snapshot.units.temperature,
																1,
															)}
														</p>
													</div>
													<div className="rounded-xl border border-white/10 bg-white/5 px-3 py-2">
														<p className="text-[11px] text-zinc-500">PM2.5</p>
														<p className="font-semibold text-white">
															{formatReadingWithUnit(
																snapshot.pm25,
																snapshot.units.pm25,
																1,
															)}
														</p>
													</div>
													<div className="rounded-xl border border-white/10 bg-white/5 px-3 py-2">
														<p className="text-[11px] text-zinc-500">UV</p>
														<p className="font-semibold text-white">
															{formatReadingWithUnit(
																snapshot.uvIndex,
																snapshot.units.uvIndex,
																1,
															)}
														</p>
													</div>
													<div className="rounded-xl border border-white/10 bg-white/5 px-3 py-2">
														<p className="text-[11px] text-zinc-500">Weather</p>
														<p className="font-semibold text-white">
															{snapshot.weatherLabel}
														</p>
													</div>
												</div>
											</>
										)}
									</div>
								);
							})}
						</div>
					)}
				</div>
				<div className="relative z-10 rounded-r-xl border-l-2 border-red-500 bg-gradient-to-r from-red-500/10 to-transparent p-4">
					<div className="flex items-start gap-3">
						<div className="mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full bg-red-400 animate-ping" />
						<div className="w-full">
							<p className="mb-1 text-sm font-bold text-red-400">
								Hazard Alert in your sector
							</p>
							<p className="text-xs leading-relaxed text-zinc-400">
								{localSummary}
							</p>
							<div className="mt-3 grid gap-2">
								{localSafetyMeasures.map((measure) => (
									<div
										key={measure}
										className="rounded-xl border border-white/5 bg-white/5 px-3 py-2 text-xs text-zinc-200"
									>
										{measure}
									</div>
								))}
							</div>
						</div>
					</div>
				</div>

				<button
					type="button"
					onClick={handleNearestCleanZone}
					className="group relative z-10 mt-3 flex w-full cursor-pointer items-center justify-between rounded-xl border border-emerald-500/30 bg-white/5 px-4 py-3 text-sm font-bold text-emerald-400 shadow-[0_0_15px_rgba(16,185,129,0.1)] transition-colors hover:border-emerald-500/60 hover:bg-white/10"
				>
					<div className="flex items-center gap-2">
						<MapIcon className="h-4 w-4" />
						<span>
							{greenDestination
								? "Refresh Clean Zone Route"
								: "Find Nearest Clean Zone"}
						</span>
					</div>
					<ChevronRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
				</button>

				{greenDestination && (
					<div className="relative z-10 mt-3 rounded-2xl border border-emerald-500/25 bg-emerald-500/10 p-4">
						<div className="flex items-start justify-between gap-3">
							<div>
								<p className="text-xs uppercase tracking-[0.2em] text-emerald-200/70">
									Nearest clean zone
								</p>
								<h3 className="text-base font-bold text-white">
									{greenDestination.name}
								</h3>
							</div>
							<span className="rounded-full border border-emerald-500/30 px-2.5 py-1 text-[11px] font-semibold text-emerald-200">
								{greenDestination.distanceKm.toFixed(1)} km
							</span>
						</div>
						<p className="mt-2 text-xs leading-relaxed text-emerald-100/80">
							{greenDestination.note}
						</p>
					</div>
				)}
			</motion.div>

			<AnimatePresence>
				{activeMetric && (
					<motion.div
						initial={{ opacity: 0, scale: 0.95, y: 20 }}
						animate={{ opacity: 1, scale: 1, y: 0 }}
						exit={{ opacity: 0, scale: 0.95, y: 20 }}
						className="pointer-events-auto absolute bottom-4 left-4 right-4 z-50 rounded-3xl border border-white/10 bg-[#0c0c0e]/95 p-6 text-white shadow-[0_0_60px_rgba(0,0,0,0.8)] backdrop-blur-3xl md:bottom-4 md:left-4 md:right-auto md:w-[400px]"
					>
						<div className="mb-8 flex items-center justify-between">
							<h3 className="text-xl font-bold tracking-tight capitalize">
								{activeMetric} Deep-Dive
							</h3>
							<button
								type="button"
								onClick={() => setActiveMetric(null)}
								className="cursor-pointer rounded-full bg-white/5 p-2 transition-colors hover:bg-white/10"
							>
								<X className="h-4 w-4" />
							</button>
						</div>

						<div className="space-y-6">
							<div className="rounded-2xl border border-white/5 bg-white/5 p-5">
								<h4 className="mb-2 text-xs font-bold uppercase tracking-wider text-zinc-500">
									Historical Trend
								</h4>
								<div className="flex h-24 w-full items-end gap-2 overflow-hidden px-1">
									{trendBars.map((bar) => (
										<motion.div
											key={bar.id}
											initial={{ height: 0 }}
											animate={{ height: bar.height }}
											transition={{ delay: bar.delay }}
											className="flex-1 rounded-t-sm bg-gradient-to-t from-emerald-500/20 to-emerald-400"
										/>
									))}
								</div>
								<div className="mt-3 flex justify-between text-[10px] font-medium text-zinc-500">
									<span>8:00 AM</span>
									<span>Current</span>
								</div>
							</div>

							<div>
								<h4 className="mb-2 text-xs font-bold uppercase tracking-wider text-zinc-500">
									Impact Analysis
								</h4>
								<p className="text-sm leading-relaxed text-zinc-300">
									{localEnvironment?.summary ??
										"Current levels indicate prolonged exposure may affect individuals with respiratory conditions."}{" "}
									The{" "}
									<span className="font-semibold text-emerald-400">
										{highlightedCleanZone}
									</span>{" "}
									({highlightedCleanZoneDistance} km away) is currently
									providing a localized buffer.
								</p>
							</div>

							<button
								type="button"
								className="group flex w-full cursor-pointer items-center justify-between rounded-xl border border-white/10 bg-white/5 px-4 py-4 text-sm font-bold transition-colors hover:bg-white/10"
							>
								<span>Set Custom Alert for this Metric</span>
								<ChevronRight className="h-4 w-4 text-zinc-500 transition-all group-hover:translate-x-1 group-hover:text-white" />
							</button>
						</div>
					</motion.div>
				)}

				{showPulseCheck && (
					<motion.div
						initial={{ opacity: 0, scale: 0.95, y: 20 }}
						animate={{ opacity: 1, scale: 1, y: 0 }}
						exit={{ opacity: 0, scale: 0.95, y: 20 }}
						className="pointer-events-auto absolute bottom-4 left-4 right-4 z-50 rounded-3xl border border-white/10 bg-[#0c0c0e]/95 p-6 text-white shadow-[0_0_60px_rgba(0,0,0,0.8)] backdrop-blur-3xl md:bottom-4 md:left-4 md:right-auto md:w-[400px]"
					>
						<div className="mb-6 flex items-center gap-3">
							<div className="flex h-10 w-10 items-center justify-center rounded-full bg-emerald-500/20">
								<CheckCircle2 className="h-5 w-5 text-emerald-400" />
							</div>
							<div>
								<h3 className="text-lg font-bold">Mission Accomplished!</h3>
								<p className="text-xs font-medium text-emerald-400">
									+50 XP Earned
								</p>
							</div>
						</div>

						<div className="mb-6 space-y-4">
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
											safety: Number.parseInt(e.target.value, 10),
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
									htmlFor="pulse-accuracy"
									className="mb-2 block text-xs font-bold text-zinc-400"
								>
									2. Was the pollution accurately predicted?
								</label>
								<input
									id="pulse-accuracy"
									type="range"
									min="1"
									max="10"
									value={questions.accuracy}
									onChange={(e) =>
										setQuestions((q) => ({
											...q,
											accuracy: Number.parseInt(e.target.value, 10),
										}))
									}
									className="mb-1 w-full accent-emerald-500"
								/>
								<div className="flex justify-between text-[10px] text-zinc-500">
									<span>Not at all</span>
									<span>Perfectly</span>
								</div>
							</div>
							<div>
								<label
									htmlFor="pulse-comments"
									className="mb-2 block text-xs font-bold text-zinc-400"
								>
									3. Any additional comments?
								</label>
								<textarea
									id="pulse-comments"
									value={questions.comments}
									onChange={(e) =>
										setQuestions((q) => ({ ...q, comments: e.target.value }))
									}
									className="w-full resize-none rounded-xl border border-white/10 bg-black/50 p-3 text-sm text-zinc-200 focus:border-emerald-500/50 focus:outline-none"
									rows={2}
									placeholder="Optional feedback..."
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
							className="w-full cursor-pointer rounded-xl bg-white py-3 text-sm font-bold text-black transition-colors hover:bg-zinc-200"
						>
							Submit Pulse Check
						</button>
					</motion.div>
				)}
			</AnimatePresence>
		</>
	);
}
