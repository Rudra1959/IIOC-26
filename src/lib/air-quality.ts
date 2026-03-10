export type AqiBand =
	| "good"
	| "moderate"
	| "unhealthy-sensitive"
	| "unhealthy"
	| "very-unhealthy"
	| "hazardous";

export interface AqiMeta {
	band: AqiBand;
	label: string;
	summary: string;
}

export interface CleanZoneDestination {
	coordinates: [number, number];
	name: string;
	distanceKm: number;
	note: string;
}

const CLEAN_ZONE_TEMPLATES = [
	{
		name: "Botanical Garden Refuge",
		offset: [-0.012, 0.009] as [number, number],
		note: "Dense canopy and low roadside exposure.",
	},
	{
		name: "Lakeside Fresh Air Loop",
		offset: [0.01, -0.006] as [number, number],
		note: "Open breezeways help disperse trapped pollutants.",
	},
	{
		name: "Riverside Green Corridor",
		offset: [-0.016, 0.004] as [number, number],
		note: "Tree cover and limited traffic create a cleaner pocket.",
	},
	{
		name: "Community Eco Park",
		offset: [0.007, 0.013] as [number, number],
		note: "Vegetation buffers and pedestrian-only access reduce exposure.",
	},
];

export function getAqiMeta(aqi: number): AqiMeta {
	if (aqi <= 50) {
		return {
			band: "good",
			label: "Good",
			summary: "Air quality is comfortable for normal outdoor activity.",
		};
	}

	if (aqi <= 100) {
		return {
			band: "moderate",
			label: "Moderate",
			summary:
				"Most people are fine outdoors, but sensitive groups should monitor symptoms.",
		};
	}

	if (aqi <= 150) {
		return {
			band: "unhealthy-sensitive",
			label: "Unhealthy for sensitive groups",
			summary:
				"Children, older adults, and people with asthma should limit sustained exertion.",
		};
	}

	if (aqi <= 200) {
		return {
			band: "unhealthy",
			label: "Unhealthy",
			summary:
				"Outdoor exposure should be reduced, especially during peak heat and traffic hours.",
		};
	}

	if (aqi <= 300) {
		return {
			band: "very-unhealthy",
			label: "Very unhealthy",
			summary:
				"Health effects become more likely for everyone and outdoor time should stay brief.",
		};
	}

	return {
		band: "hazardous",
		label: "Hazardous",
		summary:
			"Avoid outdoor activity and move to filtered indoor air if possible.",
	};
}

export function getSafetyMeasuresForAqi(aqi: number) {
	const measures = [
		"Keep windows closed during high-traffic hours and use a fan or air purifier indoors.",
		"Carry water and reduce strenuous exercise until the air clears.",
	];

	if (aqi > 100) {
		measures.unshift(
			"Wear a well-fitted mask if you need to be outside for more than a few minutes.",
		);
	}

	if (aqi > 150) {
		measures.push(
			"Choose tree-lined or indoor routes instead of roadside walking corridors.",
		);
	}

	if (aqi > 200) {
		measures.push(
			"Check on children, older adults, and anyone with asthma or breathing difficulty.",
		);
	}

	return measures.slice(0, 4);
}

function getDistanceKm(from: [number, number], to: [number, number]) {
	const [fromLng, fromLat] = from;
	const [toLng, toLat] = to;
	const earthRadiusKm = 6371;
	const dLat = ((toLat - fromLat) * Math.PI) / 180;
	const dLng = ((toLng - fromLng) * Math.PI) / 180;
	const startLat = (fromLat * Math.PI) / 180;
	const endLat = (toLat * Math.PI) / 180;

	const a =
		Math.sin(dLat / 2) ** 2 +
		Math.cos(startLat) * Math.cos(endLat) * Math.sin(dLng / 2) ** 2;

	return earthRadiusKm * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
}

export function getNearestCleanZone(
	userLocation: [number, number],
): CleanZoneDestination {
	const candidates = CLEAN_ZONE_TEMPLATES.map((template) => {
		const coordinates: [number, number] = [
			userLocation[0] + template.offset[0],
			userLocation[1] + template.offset[1],
		];

		return {
			coordinates,
			name: template.name,
			note: template.note,
			distanceKm: getDistanceKm(userLocation, coordinates),
		};
	});

	return candidates.reduce((closest, candidate) =>
		candidate.distanceKm < closest.distanceKm ? candidate : closest,
	);
}
