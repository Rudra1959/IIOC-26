export interface RoutePoint {
	latitude: number;
	longitude: number;
}

export interface RoadRoute {
	coordinates: [number, number][];
	distanceMeters: number;
	durationSeconds: number;
	source: "road";
}

interface OsrmRouteResponse {
	routes?: Array<{
		distance: number;
		duration: number;
		geometry?: {
			coordinates?: [number, number][];
		};
	}>;
}

interface CacheEntry {
	expiresAt: number;
	value: RoadRoute;
}

const ROUTING_CACHE_TTL_MS = 15 * 60 * 1000;
const ROUTING_ENDPOINT = "https://router.project-osrm.org/route/v1/driving";
const routeCache = new Map<string, CacheEntry>();

function getRouteCacheKey(from: RoutePoint, to: RoutePoint) {
	return `${from.longitude.toFixed(5)},${from.latitude.toFixed(5)}::${to.longitude.toFixed(5)},${to.latitude.toFixed(5)}`;
}

function getCachedRoute(key: string) {
	const cached = routeCache.get(key);

	if (!cached) {
		return null;
	}

	if (cached.expiresAt < Date.now()) {
		routeCache.delete(key);
		return null;
	}

	return cached.value;
}

function setCachedRoute(key: string, value: RoadRoute) {
	routeCache.set(key, {
		expiresAt: Date.now() + ROUTING_CACHE_TTL_MS,
		value,
	});
}

function buildRouteUrl(from: RoutePoint, to: RoutePoint) {
	const coordinates = `${from.longitude},${from.latitude};${to.longitude},${to.latitude}`;
	const url = new URL(`${ROUTING_ENDPOINT}/${coordinates}`);
	url.searchParams.set("overview", "full");
	url.searchParams.set("geometries", "geojson");
	url.searchParams.set("steps", "false");
	url.searchParams.set("annotations", "false");
	return url.toString();
}

export async function fetchRoadRoute(
	from: RoutePoint,
	to: RoutePoint,
): Promise<RoadRoute> {
	const cacheKey = getRouteCacheKey(from, to);
	const cached = getCachedRoute(cacheKey);

	if (cached) {
		return cached;
	}

	const response = await fetch(buildRouteUrl(from, to));

	if (!response.ok) {
		throw new Error(`Routing request failed with ${response.status}`);
	}

	const data = (await response.json()) as OsrmRouteResponse;
	const route = data.routes?.[0];
	const coordinates = route?.geometry?.coordinates;

	if (!route || !coordinates?.length) {
		throw new Error("No road route available for these points.");
	}

	const result: RoadRoute = {
		coordinates,
		distanceMeters: route.distance,
		durationSeconds: route.duration,
		source: "road",
	};

	setCachedRoute(cacheKey, result);

	return result;
}
