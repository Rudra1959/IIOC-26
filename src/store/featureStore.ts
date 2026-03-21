import { create } from "zustand";
import { createJSONStorage, persist } from "zustand/middleware";

export type ModalId =
	| "alerts"
	| "globalRank"
	| "airPassport"
	| "cityDuel"
	| "lungSimulator"
	| "bodyXRay"
	| "hospitalNetwork"
	| "timeMachine"
	| "pollutionDNA"
	| "radar"
	| "satellite"
	| "aqiMarket"
	| "carbonTracker"
	| "citizenReport"
	| "communityLeaderboard"
	| "pollutionNews"
	| "aqiMusic"
	| "aiAssistant"
	| "aiOracle"
	| "chemLab"
	| "ghostCities"
	| "cityBuilder"
	| "aqiQuest";

export type AppMode = "citizen" | "government";

interface FeatureState {
	mode: AppMode;
	setMode: (mode: AppMode) => void;
	nightMode: boolean;
	setNightMode: (on: boolean) => void;
	openModals: Set<ModalId>;
	openModal: (id: ModalId) => void;
	closeModal: (id: ModalId) => void;
	toggleModal: (id: ModalId) => void;
}

export const useFeatureStore = create<FeatureState>()(
	persist(
		(set) => ({
			mode: "citizen" as AppMode,
			setMode: (mode) => set({ mode }),
			nightMode: false,
			setNightMode: (on) => set({ nightMode: on }),
			openModals: new Set<ModalId>(),
			openModal: (id) =>
				set((state) => {
					const next = new Set(state.openModals);
					next.add(id);
					return { openModals: next };
				}),
			closeModal: (id) =>
				set((state) => {
					const next = new Set(state.openModals);
					next.delete(id);
					return { openModals: next };
				}),
			toggleModal: (id) =>
				set((state) => {
					const next = new Set(state.openModals);
					if (next.has(id)) {
						next.delete(id);
					} else {
						next.add(id);
					}
					return { openModals: next };
				}),
		}),
		{
			name: "airsentinel-features",
			storage: createJSONStorage(() => localStorage),
			partialize: (state) => ({
				mode: state.mode,
				nightMode: state.nightMode,
			}),
		},
	),
);
