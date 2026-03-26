export interface Badge {
	id: string;
	name: string;
	description: string;
	icon: string;
	xpReward: number;
	rarity: "common" | "rare" | "epic" | "legendary";
	criteria: BadgeCriteria;
}

export interface BadgeCriteria {
	type:
		| "cleanup"
		| "streak"
		| "level"
		| "explore"
		| "social"
		| "mission"
		| "custom";
	target: number;
}

export const BADGES: Badge[] = [
	{
		id: "eco-rookie",
		name: "Eco-Rookie",
		description: "Complete your first cleanup mission",
		icon: "🌱",
		xpReward: 50,
		rarity: "common",
		criteria: { type: "cleanup", target: 1 },
	},
	{
		id: "green-commuter",
		name: "Green Commuter",
		description: "Use a green route 10 times",
		icon: "🌿",
		xpReward: 100,
		rarity: "common",
		criteria: { type: "custom", target: 10 },
	},
	{
		id: "on-fire",
		name: "On Fire",
		description: "Maintain a 7-day check-in streak",
		icon: "🔥",
		xpReward: 150,
		rarity: "rare",
		criteria: { type: "streak", target: 7 },
	},
	{
		id: "champion",
		name: "Champion",
		description: "Reach level 10",
		icon: "🏆",
		xpReward: 500,
		rarity: "rare",
		criteria: { type: "level", target: 10 },
	},
	{
		id: "watchful-eye",
		name: "Watchful Eye",
		description: "Check the app for 30 days",
		icon: "👁️",
		xpReward: 300,
		rarity: "rare",
		criteria: { type: "streak", target: 30 },
	},
	{
		id: "explorer",
		name: "Explorer",
		description: "View 10 different locations",
		icon: "🗺️",
		xpReward: 150,
		rarity: "common",
		criteria: { type: "explore", target: 10 },
	},
	{
		id: "accurate",
		name: "Accurate",
		description: "Get 5 perfect AQI predictions",
		icon: "🎯",
		xpReward: 100,
		rarity: "rare",
		criteria: { type: "custom", target: 5 },
	},
	{
		id: "clean-air-warrior",
		name: "Clean Air Warrior",
		description: "Complete 50 cleanup missions",
		icon: "🛡️",
		xpReward: 750,
		rarity: "epic",
		criteria: { type: "cleanup", target: 50 },
	},
	{
		id: "sun-chaser",
		name: "Sun Chaser",
		description: "Check UV index for 7 days",
		icon: "☀️",
		xpReward: 100,
		rarity: "common",
		criteria: { type: "custom", target: 7 },
	},
	{
		id: "weather-wise",
		name: "Weather Wise",
		description: "Check the forecast 100 times",
		icon: "🌧️",
		xpReward: 200,
		rarity: "rare",
		criteria: { type: "custom", target: 100 },
	},
	{
		id: "source-hunter",
		name: "Source Hunter",
		description: "Use Threat Attribution 20 times",
		icon: "🏭",
		xpReward: 250,
		rarity: "rare",
		criteria: { type: "custom", target: 20 },
	},
	{
		id: "data-nut",
		name: "Data Nut",
		description: "Open all available modals",
		icon: "📊",
		xpReward: 300,
		rarity: "rare",
		criteria: { type: "custom", target: 30 },
	},
	{
		id: "quest-hero",
		name: "Quest Hero",
		description: "Win 10 AQI battles",
		icon: "⚔️",
		xpReward: 400,
		rarity: "epic",
		criteria: { type: "mission", target: 10 },
	},
	{
		id: "transit-pro",
		name: "Transit Pro",
		description: "Use all transport modes",
		icon: "🚌",
		xpReward: 200,
		rarity: "common",
		criteria: { type: "custom", target: 6 },
	},
	{
		id: "home-guard",
		name: "Home Guard",
		description: "Check home AQI 50 times",
		icon: "🏠",
		xpReward: 300,
		rarity: "rare",
		criteria: { type: "custom", target: 50 },
	},
	{
		id: "star-collector",
		name: "Star Collector",
		description: "Earn 10 badges",
		icon: "⭐",
		xpReward: 500,
		rarity: "epic",
		criteria: { type: "custom", target: 10 },
	},
	{
		id: "consistent",
		name: "Consistent",
		description: "Maintain a 30-day streak",
		icon: "🔐",
		xpReward: 750,
		rarity: "epic",
		criteria: { type: "streak", target: 30 },
	},
	{
		id: "veteran",
		name: "Veteran",
		description: "Use the app for 100 days",
		icon: "🎖️",
		xpReward: 1000,
		rarity: "legendary",
		criteria: { type: "streak", target: 100 },
	},
	{
		id: "speed-runner",
		name: "Speed Runner",
		description: "Complete 10 cleanups in one day",
		icon: "🚀",
		xpReward: 300,
		rarity: "rare",
		criteria: { type: "cleanup", target: 10 },
	},
	{
		id: "diamond",
		name: "Diamond",
		description: "Reach level 25",
		icon: "💎",
		xpReward: 1500,
		rarity: "legendary",
		criteria: { type: "level", target: 25 },
	},
];

export function getBadgeById(id: string): Badge | undefined {
	return BADGES.find((b) => b.id === id);
}

export function getBadgesByRarity(rarity: Badge["rarity"]): Badge[] {
	return BADGES.filter((b) => b.rarity === rarity);
}

export function getBadgeProgress(
	badge: Badge,
	userStats: {
		cleanups: number;
		streak: number;
		level: number;
		explorations: number;
		badges: number;
	},
): number {
	switch (badge.criteria.type) {
		case "cleanup":
			return Math.min(userStats.cleanups / badge.criteria.target, 1);
		case "streak":
			return Math.min(userStats.streak / badge.criteria.target, 1);
		case "level":
			return Math.min(userStats.level / badge.criteria.target, 1);
		case "explore":
			return Math.min(userStats.explorations / badge.criteria.target, 1);
		case "custom":
			return Math.min(userStats.cleanups / badge.criteria.target, 1);
		default:
			return 0;
	}
}
