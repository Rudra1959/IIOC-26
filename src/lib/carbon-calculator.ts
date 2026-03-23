export type TransportMode =
	| "car"
	| "bus"
	| "train_electric"
	| "train_diesel"
	| "flight"
	| "bike"
	| "walk";

export interface EmissionRate {
	mode: TransportMode;
	label: string;
	icon: string;
	carbonGPerKm: number;
	avgSpeedKmh: number;
	hasRoute: boolean;
}

export const EMISSION_RATES: Record<TransportMode, EmissionRate> = {
	car: {
		mode: "car",
		label: "Car",
		icon: "🚗",
		carbonGPerKm: 192,
		avgSpeedKmh: 60,
		hasRoute: true,
	},
	bus: {
		mode: "bus",
		label: "Bus",
		icon: "🚌",
		carbonGPerKm: 89,
		avgSpeedKmh: 40,
		hasRoute: true,
	},
	train_electric: {
		mode: "train_electric",
		label: "Train (Electric)",
		icon: "🚂",
		carbonGPerKm: 41,
		avgSpeedKmh: 80,
		hasRoute: true,
	},
	train_diesel: {
		mode: "train_diesel",
		label: "Train (Diesel)",
		icon: "🚂",
		carbonGPerKm: 89,
		avgSpeedKmh: 60,
		hasRoute: true,
	},
	flight: {
		mode: "flight",
		label: "Flight",
		icon: "✈️",
		carbonGPerKm: 255,
		avgSpeedKmh: 800,
		hasRoute: false,
	},
	bike: {
		mode: "bike",
		label: "Bike",
		icon: "🚴",
		carbonGPerKm: 0,
		avgSpeedKmh: 15,
		hasRoute: true,
	},
	walk: {
		mode: "walk",
		label: "Walk",
		icon: "🚶",
		carbonGPerKm: 0,
		avgSpeedKmh: 5,
		hasRoute: true,
	},
};

export interface RouteResult {
	mode: TransportMode;
	distanceKm: number;
	durationHours: number;
	durationMinutes: number;
	carbonGrams: number;
	carbonKg: number;
	aqi: number;
	coordinates: [number, number][];
	available: boolean;
}

export function calculateCarbon(
	mode: TransportMode,
	distanceKm: number,
): number {
	return EMISSION_RATES[mode].carbonGPerKm * distanceKm;
}

export function calculateDuration(
	mode: TransportMode,
	distanceKm: number,
): number {
	return distanceKm / EMISSION_RATES[mode].avgSpeedKmh;
}

export function formatCarbon(grams: number): string {
	if (grams >= 1000) {
		return `${(grams / 1000).toFixed(1)} kg CO₂`;
	}
	return `${Math.round(grams)} g CO₂`;
}

export function formatDuration(hours: number): string {
	const h = Math.floor(hours);
	const m = Math.round((hours - h) * 60);
	if (h === 0) return `${m}m`;
	if (m === 0) return `${h}h`;
	return `${h}h ${m}m`;
}

export function getCarbonColor(grams: number): string {
	if (grams === 0) return "#22c55e";
	if (grams < 50000) return "#14b8a6";
	if (grams < 100000) return "#eab308";
	if (grams < 150000) return "#f97316";
	return "#dc2626";
}

export function getCarbonLevel(grams: number): {
	label: string;
	color: string;
} {
	if (grams === 0) return { label: "Zero Emission", color: "#22c55e" };
	if (grams < 50000) return { label: "Low", color: "#14b8a6" };
	if (grams < 100000) return { label: "Moderate", color: "#eab308" };
	if (grams < 150000) return { label: "High", color: "#f97316" };
	return { label: "Very High", color: "#dc2626" };
}

export function getAqiColor(aqi: number): string {
	if (aqi <= 50) return "#22c55e";
	if (aqi <= 100) return "#eab308";
	if (aqi <= 150) return "#f97316";
	if (aqi <= 200) return "#dc2626";
	return "#7f1d1d";
}

export function getAqiLabel(aqi: number): string {
	if (aqi <= 50) return "Good";
	if (aqi <= 100) return "Moderate";
	if (aqi <= 150) return "Unhealthy";
	if (aqi <= 200) return "Very Unhealthy";
	return "Hazardous";
}

export function haversineDistance(
	lat1: number,
	lon1: number,
	lat2: number,
	lon2: number,
): number {
	const R = 6371;
	const dLat = ((lat2 - lat1) * Math.PI) / 180;
	const dLon = ((lon2 - lon1) * Math.PI) / 180;
	const a =
		Math.sin(dLat / 2) * Math.sin(dLat / 2) +
		Math.cos((lat1 * Math.PI) / 180) *
			Math.cos((lat2 * Math.PI) / 180) *
			Math.sin(dLon / 2) *
			Math.sin(dLon / 2);
	const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
	return R * c;
}

export function generateFlightPath(
	start: [number, number],
	end: [number, number],
): [number, number][] {
	const points: [number, number][] = [];
	const steps = 50;

	for (let i = 0; i <= steps; i++) {
		const t = i / steps;
		const lat = start[0] + (end[0] - start[0]) * t;
		const lon = start[1] + (end[1] - start[1]) * t;
		const arcHeight = Math.sin(t * Math.PI) * 5;
		points.push([lat + arcHeight, lon]);
	}

	return points;
}

export function generateTrainPath(
	start: [number, number],
	end: [number, number],
): [number, number][] {
	const points: [number, number][] = [];
	const steps = 20;

	for (let i = 0; i <= steps; i++) {
		const t = i / steps;
		const lat = start[0] + (end[0] - start[0]) * t;
		const lon = start[1] + (end[1] - start[1]) * t;
		points.push([lat, lon]);
	}

	return points;
}
