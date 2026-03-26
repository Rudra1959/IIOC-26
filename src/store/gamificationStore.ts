import { create } from "zustand";
import { persist } from "zustand/middleware";
import { BADGES, type Badge } from "#/lib/badges";

interface DailyMission {
	id: string;
	title: string;
	description: string;
	xpReward: number;
	type: "checkin" | "cleanup" | "explore" | "social";
	target: number;
	progress: number;
	completed: boolean;
	expiresAt: number;
}

interface GamificationState {
	xp: number;
	level: number;
	streak: number;
	longestStreak: number;
	lastCheckIn: number | null;
	badges: string[];
	completedCleanups: number;
	explorations: number;
	dailyMissions: DailyMission[];
	totalXpEarned: number;

	addXp: (amount: number) => void;
	checkIn: () => void;
	incrementCleanups: () => void;
	incrementExplorations: () => void;
	unlockBadge: (badgeId: string) => void;
	updateMissionProgress: (missionId: string, amount: number) => void;
	completeMission: (missionId: string) => void;
	refreshDailyMissions: () => void;
	getLevelFromXp: (xp: number) => number;
	getXpForNextLevel: (level: number) => number;
	getXpProgress: () => number;
}

function generateDailyMissions(): DailyMission[] {
	const now = Date.now();
	const tomorrow = new Date();
	tomorrow.setDate(tomorrow.getDate() + 1);
	tomorrow.setHours(0, 0, 0, 0);

	const missionTemplates = [
		{
			title: "Morning Check-in",
			description: "Open the app to start your day",
			xpReward: 10,
			type: "checkin" as const,
			target: 1,
		},
		{
			title: "Clean Sweep",
			description: "Complete 1 cleanup mission",
			xpReward: 50,
			type: "cleanup" as const,
			target: 1,
		},
		{
			title: "Weather Watch",
			description: "Check the weather forecast",
			xpReward: 15,
			type: "checkin" as const,
			target: 1,
		},
		{
			title: "Explorer",
			description: "View a new location",
			xpReward: 20,
			type: "explore" as const,
			target: 1,
		},
		{
			title: "Route Planner",
			description: "Plan a route",
			xpReward: 25,
			type: "social" as const,
			target: 1,
		},
	];

	const shuffled = missionTemplates.sort(() => Math.random() - 0.5);
	return shuffled.slice(0, 3).map((m, i) => ({
		id: `mission-${now}-${i}`,
		...m,
		progress: 0,
		completed: false,
		expiresAt: tomorrow.getTime(),
	}));
}

export const useGamificationStore = create<GamificationState>()(
	persist(
		(set, get) => ({
			xp: 0,
			level: 1,
			streak: 0,
			longestStreak: 0,
			lastCheckIn: null,
			badges: ["scout"],
			completedCleanups: 0,
			explorations: 0,
			dailyMissions: generateDailyMissions(),
			totalXpEarned: 0,

			addXp: (amount) => {
				set((state) => {
					const newXp = state.xp + amount;
					const newLevel = get().getLevelFromXp(newXp);
					return {
						xp: newXp,
						level: newLevel,
						totalXpEarned: state.totalXpEarned + amount,
					};
				});
			},

			checkIn: () => {
				const now = Date.now();
				const today = new Date();
				today.setHours(0, 0, 0, 0);
				const todayStart = today.getTime();

				set((state) => {
					if (state.lastCheckIn && state.lastCheckIn >= todayStart) {
						return state;
					}

					const yesterday = new Date(today);
					yesterday.setDate(yesterday.getDate() - 1);
					const yesterdayStart = yesterday.getTime();

					let newStreak = 1;
					if (state.lastCheckIn && state.lastCheckIn >= yesterdayStart) {
						newStreak = state.streak + 1;
					}

					const mission = state.dailyMissions.find(
						(m) => m.type === "checkin" && !m.completed,
					);
					if (mission) {
						get().updateMissionProgress(mission.id, 1);
					}

					return {
						lastCheckIn: now,
						streak: newStreak,
						longestStreak: Math.max(state.longestStreak, newStreak),
					};
				});

				get().addXp(10);
			},

			incrementCleanups: () => {
				set((state) => ({ completedCleanups: state.completedCleanups + 1 }));

				const state = get();
				const mission = state.dailyMissions.find(
					(m) => m.type === "cleanup" && !m.completed,
				);
				if (mission) {
					get().updateMissionProgress(mission.id, 1);
				}

				get().addXp(50);
			},

			incrementExplorations: () => {
				set((state) => ({ explorations: state.explorations + 1 }));

				const state = get();
				const mission = state.dailyMissions.find(
					(m) => m.type === "explore" && !m.completed,
				);
				if (mission) {
					get().updateMissionProgress(mission.id, 1);
				}
			},

			unlockBadge: (badgeId) => {
				set((state) => {
					if (state.badges.includes(badgeId)) return state;
					const badge = BADGES.find((b) => b.id === badgeId);
					if (badge) {
						get().addXp(badge.xpReward);
					}
					return { badges: [...state.badges, badgeId] };
				});
			},

			updateMissionProgress: (missionId, amount) => {
				set((state) => ({
					dailyMissions: state.dailyMissions.map((m) => {
						if (m.id !== missionId) return m;
						const newProgress = Math.min(m.progress + amount, m.target);
						const completed = newProgress >= m.target;
						if (completed && !m.completed) {
							get().addXp(m.xpReward);
						}
						return { ...m, progress: newProgress, completed };
					}),
				}));
			},

			completeMission: (missionId) => {
				set((state) => ({
					dailyMissions: state.dailyMissions.map((m) => {
						if (m.id !== missionId) return m;
						if (!m.completed) {
							get().addXp(m.xpReward);
						}
						return { ...m, completed: true, progress: m.target };
					}),
				}));
			},

			refreshDailyMissions: () => {
				const now = Date.now();
				set((state) => {
					const expired = state.dailyMissions.some((m) => m.expiresAt < now);
					if (expired) {
						return { dailyMissions: generateDailyMissions() };
					}
					return state;
				});
			},

			getLevelFromXp: (xp) => {
				let level = 1;
				let xpRequired = 100;
				let totalRequired = 0;

				while (totalRequired + xpRequired <= xp) {
					totalRequired += xpRequired;
					level++;
					xpRequired = Math.floor(xpRequired * 1.2);
				}

				return level;
			},

			getXpForNextLevel: (level) => {
				let xpRequired = 100;
				for (let i = 2; i <= level; i++) {
					xpRequired = Math.floor(xpRequired * 1.2);
				}
				return xpRequired;
			},

			getXpProgress: () => {
				const state = get();
				const currentLevelXp = state.getXpForNextLevel(state.level - 1);
				const nextLevelXp = state.getXpForNextLevel(state.level);
				const xpIntoLevel = state.xp - currentLevelXp;
				const xpNeeded = nextLevelXp - currentLevelXp;
				return xpIntoLevel / xpNeeded;
			},
		}),
		{
			name: "airsentinel-gamification",
		},
	),
);
