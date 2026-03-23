import {
	calculateCarbon,
	calculateDuration,
	EMISSION_RATES,
	generateFlightPath,
	generateTrainPath,
	haversineDistance,
	type RouteResult,
	type TransportMode,
} from "./carbon-calculator";

interface Point {
	longitude: number;
	latitude: number;
}

interface OSRMRoute {
	coordinates: [number, number][];
	distanceMeters: number;
	durationSeconds: number;
}

const routeCache = new Map<string, { route: OSRMRoute; expiresAt: number }>();
const CACHE_TTL = 15 * 60 * 1000;

async function fetchOSRMRoute(
	from: Point,
	to: Point,
	profile: string = "driving",
): Promise<OSRMRoute> {
	const cacheKey = `${from.longitude},${from.latitude}-${to.longitude},${to.latitude}-${profile}`;
	const cached = routeCache.get(cacheKey);

	if (cached && cached.expiresAt > Date.now()) {
		return cached.route;
	}

	const url = `https://router.project-osrm.org/route/v1/${profile}/${from.longitude},${from.latitude};${to.longitude},${to.latitude}?overview=full&geometries=geojson`;

	const response = await fetch(url);

	if (!response.ok) {
		throw new Error(`OSRM API error: ${response.status}`);
	}

	const data = await response.json();

	if (data.code !== "Ok" || !data.routes?.[0]) {
		throw new Error("No route found");
	}

	const route: OSRMRoute = {
		coordinates: data.routes[0].geometry.coordinates.map(
			(c: number[]) => [c[1], c[0]] as [number, number],
		),
		distanceMeters: data.routes[0].distance,
		durationSeconds: data.routes[0].duration,
	};

	routeCache.set(cacheKey, { route, expiresAt: Date.now() + CACHE_TTL });

	return route;
}

export async function getRouteForMode(
	mode: TransportMode,
	origin: [number, number],
	destination: [number, number],
	currentAqi: number = 85,
): Promise<RouteResult> {
	const distanceKm = haversineDistance(
		origin[0],
		origin[1],
		destination[0],
		destination[1],
	);

	const carbonGrams = calculateCarbon(mode, distanceKm);
	const durationHours = calculateDuration(mode, distanceKm);
	const hours = Math.floor(durationHours);
	const minutes = Math.round((durationHours - hours) * 60);

	let coordinates: [number, number][] = [];
	const available = true;

	try {
		if (mode === "car" || mode === "bus") {
			const profile = mode === "car" ? "driving" : "driving";
			const route = await fetchOSRMRoute(
				{ longitude: origin[1], latitude: origin[0] },
				{ longitude: destination[1], latitude: destination[0] },
				profile,
			);
			coordinates = route.coordinates;
		} else if (mode === "bike") {
			try {
				const route = await fetchOSRMRoute(
					{ longitude: origin[1], latitude: origin[0] },
					{ longitude: destination[1], latitude: destination[0] },
					"cycling",
				);
				coordinates = route.coordinates;
			} catch {
				coordinates = generateTrainPath(origin, destination);
			}
		} else if (mode === "walk") {
			try {
				const route = await fetchOSRMRoute(
					{ longitude: origin[1], latitude: origin[0] },
					{ longitude: destination[1], latitude: destination[0] },
					"foot",
				);
				coordinates = route.coordinates;
			} catch {
				coordinates = generateTrainPath(origin, destination);
			}
		} else if (mode === "train_electric" || mode === "train_diesel") {
			coordinates = generateTrainPath(origin, destination);
		} else if (mode === "flight") {
			coordinates = generateFlightPath(origin, destination);
		}
	} catch {
		coordinates = generateTrainPath(origin, destination);
	}

	if (coordinates.length === 0) {
		coordinates =
			mode === "flight"
				? generateFlightPath(origin, destination)
				: generateTrainPath(origin, destination);
	}

	const aqi =
		mode === "flight"
			? Math.round(currentAqi * 0.3)
			: Math.round(currentAqi * (0.5 + Math.random() * 0.5));

	return {
		mode,
		distanceKm: Math.round(distanceKm),
		durationHours,
		durationMinutes: hours * 60 + minutes,
		carbonGrams: Math.round(carbonGrams),
		carbonKg: Math.round(carbonGrams / 10) / 100,
		aqi,
		coordinates,
		available,
	};
}

export async function getAllRoutes(
	origin: [number, number],
	destination: [number, number],
	currentAqi: number = 85,
): Promise<RouteResult[]> {
	const modes: TransportMode[] = [
		"car",
		"bus",
		"train_electric",
		"flight",
		"bike",
		"walk",
	];

	const results = await Promise.all(
		modes.map((mode) => getRouteForMode(mode, origin, destination, currentAqi)),
	);

	return results;
}

export function getBestRoute(
	routes: RouteResult[],
	criteria: "fastest" | "greenest" | "cleanest",
): RouteResult | null {
	if (routes.length === 0) return null;

	switch (criteria) {
		case "fastest":
			return routes.reduce((best, route) =>
				route.durationHours < best.durationHours ? route : best,
			);
		case "greenest":
			return routes.reduce((best, route) =>
				route.carbonGrams < best.carbonGrams ? route : best,
			);
		case "cleanest":
			return routes.reduce((best, route) =>
				route.aqi < best.aqi ? route : best,
			);
		default:
			return null;
	}
}

export function getRouteScore(route: RouteResult): number {
	const durationScore = Math.max(0, 100 - route.durationHours * 5);
	const carbonScore = Math.max(0, 100 - route.carbonGrams / 1000);
	const aqiScore = Math.max(0, 100 - route.aqi * 0.5);

	return Math.round((durationScore + carbonScore + aqiScore) / 3);
}

export function getModeIcon(mode: TransportMode): string {
	return EMISSION_RATES[mode].icon;
}

export function getModeLabel(mode: TransportMode): string {
	return EMISSION_RATES[mode].label;
}
