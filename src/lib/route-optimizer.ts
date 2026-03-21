import { fetchRoadRoute } from "./routing";

export interface RouteOption {
	id: string;
	label: string;
	duration: number;
	distance: number;
	exposureLevel: "low" | "moderate" | "high";
	pm25Reduction: number;
	aqi: number;
	coordinates: [number, number][];
	source: "road" | "fallback";
}

interface Point {
	longitude: number;
	latitude: number;
}

interface ImpactData {
	position: [number, number];
	score: number;
}

function scoreRouteByAqi(
	coordinates: [number, number][],
	impactData: ImpactData[],
): number {
	if (coordinates.length < 2 || impactData.length === 0) return 80;

	let totalScore = 0;
	let count = 0;

	for (const coord of coordinates) {
		let minDist = Infinity;
		let nearestScore = 80;

		for (const impact of impactData) {
			const dx = coord[0] - impact.position[0];
			const dy = coord[1] - impact.position[1];
			const dist = Math.sqrt(dx * dx + dy * dy);
			if (dist < minDist) {
				minDist = dist;
				nearestScore = impact.score;
			}
		}

		if (minDist < 0.02) {
			totalScore += nearestScore;
			count++;
		}
	}

	return count > 0 ? totalScore / count : 80;
}

function getExposureLevel(aqi: number): "low" | "moderate" | "high" {
	if (aqi < 50) return "low";
	if (aqi < 100) return "moderate";
	return "high";
}

export async function calculateAlternativeRoutes(
	from: Point,
	to: Point,
	impactData: ImpactData[],
): Promise<RouteOption[]> {
	const routes: RouteOption[] = [];

	try {
		const fastest = await fetchRoadRoute(from, to);
		const fastestScore = scoreRouteByAqi(fastest.coordinates, impactData);

		routes.push({
			id: "fastest",
			label: "Fastest Route",
			duration: fastest.durationSeconds / 60,
			distance: fastest.distanceMeters / 1000,
			exposureLevel: getExposureLevel(fastestScore),
			pm25Reduction: 0,
			aqi: Math.round(fastestScore),
			coordinates: fastest.coordinates,
			source: fastest.source,
		});

		const midLat = (from.latitude + to.latitude) / 2;
		const midLng = (from.longitude + to.longitude) / 2;
		const perpLat = midLat + (to.longitude - from.longitude) * 0.08;
		const perpLng = midLng - (to.latitude - from.latitude) * 0.08;

		const cleanWaypoint: Point = {
			longitude: Math.max(-180, Math.min(180, perpLng)),
			latitude: Math.max(-85, Math.min(85, perpLat)),
		};

		try {
			const leg1 = await fetchRoadRoute(from, cleanWaypoint);
			const leg2 = await fetchRoadRoute(cleanWaypoint, to);

			const combinedCoords = [...leg1.coordinates, ...leg2.coordinates];
			const cleanScore = scoreRouteByAqi(combinedCoords, impactData);
			const fastestAqi = routes[0]?.aqi ?? 80;
			const reduction =
				fastestAqi > 0
					? Math.round(((fastestAqi - cleanScore) / fastestAqi) * 100)
					: 0;

			routes.push({
				id: "cleanest",
				label: "Blue-Sky Route",
				duration: (leg1.durationSeconds + leg2.durationSeconds) / 60,
				distance: (leg1.distanceMeters + leg2.distanceMeters) / 1000,
				exposureLevel: getExposureLevel(cleanScore),
				pm25Reduction: Math.max(0, reduction),
				aqi: Math.round(cleanScore),
				coordinates: combinedCoords,
				source:
					leg1.source === "road" && leg2.source === "road"
						? "road"
						: "fallback",
			});
		} catch {
			routes.push({
				id: "cleanest",
				label: "Blue-Sky Route",
				duration: routes[0].duration * 1.4,
				distance: routes[0].distance * 1.2,
				exposureLevel: "low",
				pm25Reduction: 30,
				aqi: Math.round(routes[0].aqi * 0.7),
				coordinates: [],
				source: "fallback",
			});
		}
	} catch {
		const fallbackAqi = 65;
		routes.push(
			{
				id: "fastest",
				label: "Fastest Route",
				duration: 25,
				distance: 8.5,
				exposureLevel: "high" as const,
				pm25Reduction: 0,
				aqi: fallbackAqi + 20,
				coordinates: [
					[from.longitude, from.latitude],
					[to.longitude, to.latitude],
				],
				source: "fallback" as const,
			},
			{
				id: "cleanest",
				label: "Blue-Sky Route",
				duration: 35,
				distance: 10.2,
				exposureLevel: "low" as const,
				pm25Reduction: 35,
				aqi: fallbackAqi,
				coordinates: [
					[from.longitude, from.latitude],
					[to.longitude, to.latitude],
				],
				source: "fallback" as const,
			},
		);
	}

	return routes;
}
