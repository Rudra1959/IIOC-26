import { create } from "zustand";
import { createJSONStorage, persist } from "zustand/middleware";
import type { CleanZoneDestination } from "#/lib/air-quality";
import type {
	AirQualityCalculations,
	HourlyForecast,
	PlaceSearchResult,
} from "#/lib/environment";

interface Source {
	score: number;
	attributedSource: string;
	aqi: number;
	isIdlingRisk: boolean;
}

type MapFocusMode = "user" | "search" | "green";

export interface RegionProfile {
	id: string;
	name: string;
	country: string;
	defaultAqi: number;
}

const POPULAR_REGIONS: RegionProfile[] = [
	{ id: "auto", name: "My Location", country: "Auto", defaultAqi: 50 },
	{ id: "delhi", name: "Delhi NCR", country: "India", defaultAqi: 180 },
	{ id: "mumbai", name: "Mumbai", country: "India", defaultAqi: 85 },
	{ id: "bangalore", name: "Bangalore", country: "India", defaultAqi: 65 },
	{ id: "hyderabad", name: "Hyderabad", country: "India", defaultAqi: 75 },
	{ id: "chennai", name: "Chennai", country: "India", defaultAqi: 70 },
	{ id: "kolkata", name: "Kolkata", country: "India", defaultAqi: 110 },
	{ id: "pune", name: "Pune", country: "India", defaultAqi: 80 },
	{ id: "jaipur", name: "Jaipur", country: "India", defaultAqi: 120 },
	{ id: "lucknow", name: "Lucknow", country: "India", defaultAqi: 150 },
	{ id: "beijing", name: "Beijing", country: "China", defaultAqi: 130 },
	{ id: "shanghai", name: "Shanghai", country: "China", defaultAqi: 95 },
	{ id: "guangzhou", name: "Guangzhou", country: "China", defaultAqi: 85 },
	{ id: "shenzhen", name: "Shenzhen", country: "China", defaultAqi: 75 },
	{ id: "chengdu", name: "Chengdu", country: "China", defaultAqi: 100 },
	{ id: "london", name: "London", country: "UK", defaultAqi: 45 },
	{ id: "paris", name: "Paris", country: "France", defaultAqi: 50 },
	{ id: "berlin", name: "Berlin", country: "Germany", defaultAqi: 40 },
	{ id: "madrid", name: "Madrid", country: "Spain", defaultAqi: 55 },
	{ id: "rome", name: "Rome", country: "Italy", defaultAqi: 60 },
	{
		id: "amsterdam",
		name: "Amsterdam",
		country: "Netherlands",
		defaultAqi: 35,
	},
	{ id: "stockholm", name: "Stockholm", country: "Sweden", defaultAqi: 25 },
	{ id: "losangeles", name: "Los Angeles", country: "USA", defaultAqi: 65 },
	{ id: "newyork", name: "New York", country: "USA", defaultAqi: 45 },
	{ id: "chicago", name: "Chicago", country: "USA", defaultAqi: 50 },
	{ id: "houston", name: "Houston", country: "USA", defaultAqi: 55 },
	{ id: "phoenix", name: "Phoenix", country: "USA", defaultAqi: 70 },
	{ id: "sanfrancisco", name: "San Francisco", country: "USA", defaultAqi: 35 },
	{ id: "seattle", name: "Seattle", country: "USA", defaultAqi: 30 },
	{ id: "denver", name: "Denver", country: "USA", defaultAqi: 40 },
	{ id: "toronto", name: "Toronto", country: "Canada", defaultAqi: 35 },
	{ id: "vancouver", name: "Vancouver", country: "Canada", defaultAqi: 25 },
	{ id: "montreal", name: "Montreal", country: "Canada", defaultAqi: 40 },
	{ id: "tokyo", name: "Tokyo", country: "Japan", defaultAqi: 55 },
	{ id: "osaka", name: "Osaka", country: "Japan", defaultAqi: 50 },
	{ id: "seoul", name: "Seoul", country: "South Korea", defaultAqi: 75 },
	{ id: "busan", name: "Busan", country: "South Korea", defaultAqi: 65 },
	{ id: "singapore", name: "Singapore", country: "Singapore", defaultAqi: 40 },
	{ id: "dubai", name: "Dubai", country: "UAE", defaultAqi: 85 },
	{ id: "abudhabi", name: "Abu Dhabi", country: "UAE", defaultAqi: 80 },
	{ id: "riyadh", name: "Riyadh", country: "Saudi Arabia", defaultAqi: 95 },
	{ id: "bangkok", name: "Bangkok", country: "Thailand", defaultAqi: 90 },
	{ id: "jakarta", name: "Jakarta", country: "Indonesia", defaultAqi: 110 },
	{
		id: "kualalumpur",
		name: "Kuala Lumpur",
		country: "Malaysia",
		defaultAqi: 75,
	},
	{ id: "manila", name: "Manila", country: "Philippines", defaultAqi: 85 },
	{ id: "hanoi", name: "Hanoi", country: "Vietnam", defaultAqi: 100 },
	{ id: "hochiminh", name: "Ho Chi Minh", country: "Vietnam", defaultAqi: 95 },
	{ id: "cairo", name: "Cairo", country: "Egypt", defaultAqi: 120 },
	{ id: "lagos", name: "Lagos", country: "Nigeria", defaultAqi: 105 },
	{ id: "nairobi", name: "Nairobi", country: "Kenya", defaultAqi: 65 },
	{
		id: "johannesburg",
		name: "Johannesburg",
		country: "South Africa",
		defaultAqi: 55,
	},
	{ id: "mexicocity", name: "Mexico City", country: "Mexico", defaultAqi: 90 },
	{ id: "saopaulo", name: "Sao Paulo", country: "Brazil", defaultAqi: 70 },
	{
		id: "buenosaires",
		name: "Buenos Aires",
		country: "Argentina",
		defaultAqi: 55,
	},
	{ id: "sydney", name: "Sydney", country: "Australia", defaultAqi: 30 },
	{ id: "melbourne", name: "Melbourne", country: "Australia", defaultAqi: 25 },
	{ id: "auckland", name: "Auckland", country: "New Zealand", defaultAqi: 20 },
	{ id: "moscow", name: "Moscow", country: "Russia", defaultAqi: 75 },
	{ id: "istanbul", name: "Istanbul", country: "Turkey", defaultAqi: 80 },
	{ id: "athens", name: "Athens", country: "Greece", defaultAqi: 60 },
	{ id: "lisbon", name: "Lisbon", country: "Portugal", defaultAqi: 35 },
	{ id: "vienna", name: "Vienna", country: "Austria", defaultAqi: 30 },
	{ id: "zurich", name: "Zurich", country: "Switzerland", defaultAqi: 25 },
	{ id: "brussels", name: "Brussels", country: "Belgium", defaultAqi: 40 },
	{ id: "copenhagen", name: "Copenhagen", country: "Denmark", defaultAqi: 30 },
	{ id: "helsinki", name: "Helsinki", country: "Finland", defaultAqi: 20 },
	{ id: "oslo", name: "Oslo", country: "Norway", defaultAqi: 22 },
];

interface EnvState {
	userLocation: [number, number] | null;
	setUserLocation: (location: [number, number]) => void;
	currentAqi: number | null;
	setCurrentAqi: (aqi: number | null) => void;
	cityAverageUHI: number;
	identifiedSources: Source[];
	setInsights: (data: {
		cityAverageUHI: number;
		identifiedSources: Source[];
	}) => void;
	greenDestination: CleanZoneDestination | null;
	setGreenDestination: (location: CleanZoneDestination | null) => void;
	activeSearchPlace: PlaceSearchResult | null;
	setActiveSearchPlace: (place: PlaceSearchResult | null) => void;
	comparePlaces: PlaceSearchResult[];
	addComparePlace: (place: PlaceSearchResult) => void;
	removeComparePlace: (placeId: string) => void;
	clearComparePlaces: () => void;
	favoritePlaces: PlaceSearchResult[];
	addFavoritePlace: (place: PlaceSearchResult) => void;
	removeFavoritePlace: (placeId: string) => void;
	recentSearches: PlaceSearchResult[];
	addRecentSearch: (place: PlaceSearchResult) => void;
	mapFocus: MapFocusMode;
	setMapFocus: (focus: MapFocusMode) => void;
	mapOverlay: "aqi" | "heat" | "noise";
	setMapOverlay: (overlay: "aqi" | "heat" | "noise") => void;
	routePreference: "fastest" | "cleanest";
	setRoutePreference: (pref: "fastest" | "cleanest") => void;
	selectedRegion: RegionProfile;
	setSelectedRegion: (region: RegionProfile) => void;
	availableRegions: RegionProfile[];
	airQualityCalculations: AirQualityCalculations | null;
	setAirQualityCalculations: (calc: AirQualityCalculations | null) => void;
	hourlyForecast: HourlyForecast[];
	setHourlyForecast: (forecast: HourlyForecast[]) => void;
	lastUpdated: number | null;
	setLastUpdated: (time: number) => void;
	mapZoom: number;
	setMapZoom: (zoom: number) => void;
	projectionMode: boolean;
	setProjectionMode: (mode: boolean) => void;
	showProjectionOnMap: boolean;
	setShowProjectionOnMap: (show: boolean) => void;
	clickedHexPosition: { x: number; y: number } | null;
	setClickedHexPosition: (pos: { x: number; y: number } | null) => void;
	navigationRoutes: {
		fastest?: {
			coordinates: [number, number][];
			duration: number;
			distance: number;
			aqi: number;
		};
		cleanest?: {
			coordinates: [number, number][];
			duration: number;
			distance: number;
			aqi: number;
		};
	};
	setNavigationRoutes: (routes: EnvState["navigationRoutes"]) => void;
	navigationDestination: {
		longitude: number;
		latitude: number;
		label: string;
	} | null;
	setNavigationDestination: (dest: EnvState["navigationDestination"]) => void;
	showNavigationPanel: boolean;
	setShowNavigationPanel: (show: boolean) => void;
	focusMode: boolean;
	setFocusMode: (mode: boolean) => void;
	activeInterventions: {
		id: string;
		effect: number;
		maxReduction: number;
	}[];
	setActiveInterventions: (
		interventions: EnvState["activeInterventions"],
	) => void;
	projectedAqiDelta: number;
	setProjectedAqiDelta: (delta: number) => void;
	showWind: boolean;
	setShowWind: (show: boolean) => void;
	highlightedMetric: "pm25" | "temperature" | "humidity" | "wind" | "uv" | null;
	setHighlightedMetric: (metric: EnvState["highlightedMetric"]) => void;
	showTerminal: boolean;
	setShowTerminal: (show: boolean) => void;
	selectedRouteId: string | null;
	setSelectedRouteId: (id: string | null) => void;
	currentWindSpeed: number | null;
	currentWindDirection: number | null;
	currentWindGusts: number | null;
	setWindData: (
		speed: number | null,
		direction: number | null,
		gusts: number | null,
	) => void;
	windGridPoints: {
		latitude: number;
		longitude: number;
		speed: number;
		direction: number;
	}[];
	setWindGridPoints: (
		points: {
			latitude: number;
			longitude: number;
			speed: number;
			direction: number;
		}[],
	) => void;
	routeDestination: {
		id: string;
		name: string;
		country: string;
		coords: [number, number];
	} | null;
	setRouteDestination: (dest: EnvState["routeDestination"]) => void;
	routeMode:
		| "car"
		| "bus"
		| "train_electric"
		| "train_diesel"
		| "flight"
		| "bike"
		| "walk";
	setRouteMode: (mode: EnvState["routeMode"]) => void;
	routeResults: {
		[mode: string]: {
			distanceKm: number;
			durationHours: number;
			durationMinutes: number;
			carbonGrams: number;
			carbonKg: number;
			aqi: number;
			coordinates: [number, number][];
		};
	};
	setRouteResults: (results: EnvState["routeResults"]) => void;
	activeRouteCoords: [number, number][];
	setActiveRouteCoords: (coords: [number, number][]) => void;
	showRoutePanel: boolean;
	setShowRoutePanel: (show: boolean) => void;
	appMode: "monitor" | "analyze" | "act";
	setAppMode: (mode: "monitor" | "analyze" | "act") => void;
	selectedMapPoint: {
		position: [number, number];
		score: number;
		trend: "rising" | "stable" | "falling";
		aqi?: number;
		pm25?: number;
		no2?: number;
		o3?: number;
	} | null;
	setSelectedMapPoint: (point: EnvState["selectedMapPoint"]) => void;
}

export const useEnvStore = create<EnvState>()(
	persist(
		(set) => ({
			userLocation: null,
			setUserLocation: (location) => set({ userLocation: location }),
			currentAqi: null,
			setCurrentAqi: (aqi) => set({ currentAqi: aqi }),
			cityAverageUHI: 25,
			identifiedSources: [],
			setInsights: (data) =>
				set({
					cityAverageUHI: data.cityAverageUHI,
					identifiedSources: data.identifiedSources,
				}),
			greenDestination: null,
			setGreenDestination: (location) => set({ greenDestination: location }),
			activeSearchPlace: null,
			setActiveSearchPlace: (place) => set({ activeSearchPlace: place }),
			comparePlaces: [],
			addComparePlace: (place) =>
				set((state) => {
					if (state.comparePlaces.some((entry) => entry.id === place.id)) {
						return state;
					}

					return {
						comparePlaces: [...state.comparePlaces, place].slice(0, 4),
					};
				}),
			removeComparePlace: (placeId) =>
				set((state) => ({
					comparePlaces: state.comparePlaces.filter(
						(place) => place.id !== placeId,
					),
				})),
			clearComparePlaces: () => set({ comparePlaces: [] }),
			favoritePlaces: [],
			addFavoritePlace: (place) =>
				set((state) => {
					if (state.favoritePlaces.some((entry) => entry.id === place.id)) {
						return state;
					}

					return {
						favoritePlaces: [place, ...state.favoritePlaces].slice(0, 8),
					};
				}),
			removeFavoritePlace: (placeId) =>
				set((state) => ({
					favoritePlaces: state.favoritePlaces.filter(
						(place) => place.id !== placeId,
					),
				})),
			recentSearches: [],
			addRecentSearch: (place) =>
				set((state) => ({
					recentSearches: [
						place,
						...state.recentSearches.filter((entry) => entry.id !== place.id),
					].slice(0, 6),
				})),
			mapFocus: "user",
			setMapFocus: (focus) => set({ mapFocus: focus }),
			mapOverlay: "aqi",
			setMapOverlay: (overlay) => set({ mapOverlay: overlay }),
			routePreference: "fastest",
			setRoutePreference: (pref) => set({ routePreference: pref }),
			selectedRegion: POPULAR_REGIONS[0],
			setSelectedRegion: (region) => set({ selectedRegion: region }),
			availableRegions: POPULAR_REGIONS,
			airQualityCalculations: null,
			setAirQualityCalculations: (calc) =>
				set({ airQualityCalculations: calc }),
			hourlyForecast: [],
			setHourlyForecast: (forecast) => set({ hourlyForecast: forecast }),
			lastUpdated: null,
			setLastUpdated: (time) => set({ lastUpdated: time }),
			mapZoom: 11,
			setMapZoom: (zoom) => set({ mapZoom: zoom }),
			projectionMode: false,
			setProjectionMode: (mode) => set({ projectionMode: mode }),
			showProjectionOnMap: false,
			setShowProjectionOnMap: (show) => set({ showProjectionOnMap: show }),
			clickedHexPosition: null,
			setClickedHexPosition: (pos) => set({ clickedHexPosition: pos }),
			navigationRoutes: {},
			setNavigationRoutes: (routes) => set({ navigationRoutes: routes }),
			navigationDestination: null,
			setNavigationDestination: (dest) => set({ navigationDestination: dest }),
			showNavigationPanel: false,
			setShowNavigationPanel: (show) => set({ showNavigationPanel: show }),
			focusMode: false,
			setFocusMode: (mode) => set({ focusMode: mode }),
			activeInterventions: [],
			setActiveInterventions: (interventions) =>
				set({ activeInterventions: interventions }),
			projectedAqiDelta: 0,
			setProjectedAqiDelta: (delta) => set({ projectedAqiDelta: delta }),
			showWind: false,
			setShowWind: (show) => set({ showWind: show }),
			highlightedMetric: null,
			setHighlightedMetric: (metric) => set({ highlightedMetric: metric }),
			showTerminal: false,
			setShowTerminal: (show) => set({ showTerminal: show }),
			selectedRouteId: null,
			setSelectedRouteId: (id) => set({ selectedRouteId: id }),
			currentWindSpeed: null,
			currentWindDirection: null,
			currentWindGusts: null,
			setWindData: (speed, direction, gusts) =>
				set({
					currentWindSpeed: speed,
					currentWindDirection: direction,
					currentWindGusts: gusts,
				}),
			windGridPoints: [],
			setWindGridPoints: (points) => set({ windGridPoints: points }),
			routeDestination: null,
			setRouteDestination: (dest) => set({ routeDestination: dest }),
			routeMode: "car",
			setRouteMode: (mode) => set({ routeMode: mode }),
			routeResults: {},
			setRouteResults: (results) => set({ routeResults: results }),
			activeRouteCoords: [],
			setActiveRouteCoords: (coords) => set({ activeRouteCoords: coords }),
			showRoutePanel: false,
			setShowRoutePanel: (show) => set({ showRoutePanel: show }),
			appMode: "monitor",
			setAppMode: (mode) => set({ appMode: mode }),
			selectedMapPoint: null,
			setSelectedMapPoint: (point) => set({ selectedMapPoint: point }),
		}),
		{
			name: "airsentinel-env-store",
			storage: createJSONStorage(() => localStorage),
			partialize: (state) => ({
				favoritePlaces: state.favoritePlaces,
				recentSearches: state.recentSearches,
			}),
		},
	),
);
