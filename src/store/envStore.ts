import { create } from "zustand";
import { createJSONStorage, persist } from "zustand/middleware";
import type { CleanZoneDestination } from "#/lib/air-quality";
import type { PlaceSearchResult } from "#/lib/environment";

interface Source {
	score: number;
	attributedSource: string;
	aqi: number;
	isIdlingRisk: boolean;
}

type MapFocusMode = "user" | "search" | "green";

interface EnvState {
	userLocation: [number, number] | null;
	setUserLocation: (location: [number, number]) => void;
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
}

export const useEnvStore = create<EnvState>()(
	persist(
		(set) => ({
			userLocation: null,
			setUserLocation: (location) => set({ userLocation: location }),
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
