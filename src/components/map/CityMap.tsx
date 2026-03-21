import type { MapViewState, PickingInfo } from "@deck.gl/core";
import {
	AmbientLight,
	FlyToInterpolator,
	LightingEffect,
	PointLight,
} from "@deck.gl/core";
import { ColumnLayer, PathLayer, ScatterplotLayer } from "@deck.gl/layers";
import DeckGL from "@deck.gl/react";
import { useQueries } from "@tanstack/react-query";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { Map as MapLibreMap } from "react-map-gl/maplibre";
import "maplibre-gl/dist/maplibre-gl.css";
import { fetchWindGrid } from "../../lib/environment";
import { fetchRoadRoute } from "../../lib/routing";
import { useEnvStore } from "../../store/envStore";

const INITIAL_VIEW_STATE: MapViewState = {
	longitude: -122.4,
	latitude: 37.74,
	zoom: 11,
	pitch: 55,
	bearing: -15,
};

const GOV_MODE_VIEW_STATE: MapViewState = {
	longitude: -122.4,
	latitude: 37.74,
	zoom: 12,
	pitch: 65,
	bearing: -30,
};

const ambientLight = new AmbientLight({
	color: [255, 255, 255],
	intensity: 1.0,
});
const pointLight = new PointLight({
	color: [255, 200, 50],
	intensity: 2.5,
	position: [-122.4, 37.74, 8000],
});
const lightingEffect = new LightingEffect({ ambientLight, pointLight });

export interface RouteSegment {
	path: number[][];
	score: number;
	color: [number, number, number];
	source?: "road" | "fallback";
	routeType?: "fastest" | "cleanest";
}

interface ImpactData {
	id: string;
	position: [number, number];
	score: number;
	projectedScore?: number;
	trend: "rising" | "stable" | "falling";
}

interface ResponseAsset {
	id: string;
	position: [number, number];
	type: "water-tanker" | "air-purifier" | "monitoring-station";
	name: string;
	status: "active" | "idle" | "maintenance";
	coverage?: number;
}

interface WindVector {
	position: [number, number];
	direction: number;
	speed: number;
}

interface MarkerData {
	id: string;
	position: [number, number];
	name: string;
	subtitle: string;
	note: string;
	kind: "search" | "compare" | "green";
}

interface PositionDatum {
	position: [number, number];
}

interface GeneratedRoute {
	id: string;
	path: [number, number][];
	color: [number, number, number];
	label: string;
	source: "road" | "fallback";
	distanceKm?: number;
	durationMinutes?: number;
}

interface RouteTarget {
	id: string;
	label: string;
	coordinates: [number, number];
	color: [number, number, number];
}

interface GreenZone {
	id: string;
	position: [number, number];
	name: string;
	radius: number;
	score: number;
}

function buildRoadCorridors(
	centerLat: number,
	centerLng: number,
): { start: [number, number]; end: [number, number] }[] {
	return [
		{
			start: [centerLng - 0.04, centerLat],
			end: [centerLng + 0.04, centerLat],
		},
		{
			start: [centerLng, centerLat - 0.04],
			end: [centerLng, centerLat + 0.04],
		},
		{
			start: [centerLng - 0.025, centerLat - 0.025],
			end: [centerLng + 0.025, centerLat + 0.025],
		},
	];
}

function distToSegment(
	point: [number, number],
	segStart: [number, number],
	segEnd: [number, number],
): number {
	const dx = segEnd[0] - segStart[0];
	const dy = segEnd[1] - segStart[1];
	const t = Math.max(
		0,
		Math.min(
			1,
			((point[0] - segStart[0]) * dx + (point[1] - segStart[1]) * dy) /
				(dx * dx + dy * dy + 0.0001),
		),
	);
	const nearX = segStart[0] + t * dx;
	const nearY = segStart[1] + t * dy;
	return Math.sqrt((point[0] - nearX) ** 2 + (point[1] - nearY) ** 2);
}

function generateLocalImpactData(
	centerLat: number,
	centerLng: number,
): ImpactData[] {
	const roadCorridors = buildRoadCorridors(centerLat, centerLng);
	const greenCenters: [number, number][] = [
		[centerLng + 0.01, centerLat - 0.006],
		[centerLng - 0.012, centerLat + 0.009],
		[centerLng + 0.018, centerLat + 0.004],
	];

	const points: ImpactData[] = [];

	for (let i = 0; i < 150; i++) {
		const angle = Math.random() * Math.PI * 2;
		const radius = Math.random() * 0.05;
		const lat = centerLat + Math.cos(angle) * radius;
		const lng = centerLng + Math.sin(angle) * radius * 1.3;
		const dist = Math.sqrt((lat - centerLat) ** 2 + (lng - centerLng) ** 2);

		let roadBoost = 0;
		for (const road of roadCorridors) {
			const d = distToSegment([lng, lat], road.start, road.end);
			if (d < 0.008) roadBoost = Math.max(roadBoost, (0.008 - d) * 2000);
		}

		let greenReduction = 0;
		for (const gc of greenCenters) {
			const gDist = Math.sqrt((lng - gc[0]) ** 2 + (lat - gc[1]) ** 2);
			if (gDist < 0.015)
				greenReduction = Math.max(greenReduction, (0.015 - gDist) * 1000);
		}

		const score = Math.max(
			5,
			Math.min(
				98,
				Math.round(
					35 + Math.random() * 55 - dist * 1000 + roadBoost - greenReduction,
				),
			),
		);

		points.push({
			id: `impact-${i}`,
			position: [lng, lat],
			score,
			trend:
				Math.random() > 0.6
					? "rising"
					: Math.random() > 0.5
						? "falling"
						: "stable",
		});
	}

	for (let i = 150; i < 190; i++) {
		const angle = Math.random() * Math.PI * 2;
		const radius = 0.015 + Math.random() * 0.02;
		const lat = centerLat + Math.cos(angle) * radius;
		const lng = centerLng + Math.sin(angle) * radius * 1.3;
		const score = Math.max(
			5,
			Math.min(35, Math.round(15 + Math.random() * 20)),
		);
		points.push({
			id: `impact-${i}`,
			position: [lng, lat],
			score,
			trend: "stable",
		});
	}

	for (let i = 190; i < 250; i++) {
		const angle = Math.random() * Math.PI * 2;
		const radius = 0.025 + Math.random() * 0.015;
		const lat = centerLat + Math.cos(angle) * radius;
		const lng = centerLng + Math.sin(angle) * radius * 1.3;
		const dist = Math.sqrt((lat - centerLat) ** 2 + (lng - centerLng) ** 2);
		const baseScore = Math.max(
			5,
			Math.min(95, Math.round(50 + Math.random() * 40 - dist * 800)),
		);
		const score = Math.round(baseScore * (0.7 + Math.random() * 0.3));
		points.push({
			id: `impact-${i}`,
			position: [lng, lat],
			score,
			trend: Math.random() > 0.7 ? "rising" : "stable",
		});
	}

	for (let i = 250; i < 300; i++) {
		const angle = Math.random() * Math.PI * 2;
		const radius = 0.003 + Math.random() * 0.008;
		const lat = centerLat + Math.cos(angle) * radius;
		const lng = centerLng + Math.sin(angle) * radius * 1.3;

		let greenReduction = 0;
		for (const gc of greenCenters) {
			const gDist = Math.sqrt((lng - gc[0]) ** 2 + (lat - gc[1]) ** 2);
			if (gDist < 0.012)
				greenReduction = Math.max(greenReduction, (0.012 - gDist) * 1200);
		}

		const score = Math.max(
			5,
			Math.min(25, Math.round(8 + Math.random() * 15 - greenReduction)),
		);
		points.push({
			id: `impact-${i}`,
			position: [lng, lat],
			score,
			trend: "falling",
		});
	}

	return points;
}

function generateGreenZones(centerLat: number, centerLng: number): GreenZone[] {
	return [
		{
			id: "zone-park",
			position: [centerLng + 0.01, centerLat - 0.006],
			name: "Central Park",
			radius: 0.008,
			score: 12,
		},
		{
			id: "zone-lake",
			position: [centerLng - 0.012, centerLat + 0.009],
			name: "Lakefront",
			radius: 0.006,
			score: 18,
		},
		{
			id: "zone-forest",
			position: [centerLng + 0.018, centerLat + 0.004],
			name: "Forest Reserve",
			radius: 0.01,
			score: 8,
		},
		{
			id: "zone-garden",
			position: [centerLng - 0.006, centerLat - 0.012],
			name: "Botanical Garden",
			radius: 0.005,
			score: 15,
		},
		{
			id: "zone-river",
			position: [centerLng + 0.022, centerLat - 0.008],
			name: "River Trail",
			radius: 0.007,
			score: 22,
		},
	];
}

function generateResponseAssets(
	centerLat: number,
	centerLng: number,
): ResponseAsset[] {
	const assets: ResponseAsset[] = [];
	const tankers = ["WT-001", "WT-002", "WT-003", "WT-004"];
	const purifiers = ["AP-101", "AP-102", "AP-103", "AP-104", "AP-105"];
	const stations = ["MON-501", "MON-502", "MON-503"];

	tankers.forEach((id, i) => {
		const angle = (i / tankers.length) * Math.PI * 2;
		const radius = 0.015 + Math.random() * 0.01;
		assets.push({
			id,
			position: [
				centerLng + Math.cos(angle) * radius,
				centerLat + Math.sin(angle) * radius * 0.8,
			],
			type: "water-tanker",
			name: `Water Tanker ${id}`,
			status: Math.random() > 0.2 ? "active" : "idle",
			coverage: 70 + Math.random() * 25,
		});
	});

	purifiers.forEach((id, i) => {
		const angle = (i / purifiers.length) * Math.PI * 2 + 0.5;
		const radius = 0.008 + Math.random() * 0.012;
		assets.push({
			id,
			position: [
				centerLng + Math.cos(angle) * radius,
				centerLat + Math.sin(angle) * radius * 0.8,
			],
			type: "air-purifier",
			name: `Air Purifier ${id}`,
			status: Math.random() > 0.15 ? "active" : "idle",
			coverage: 80 + Math.random() * 18,
		});
	});

	stations.forEach((id, i) => {
		const angle = (i / stations.length) * Math.PI * 2 + 1.2;
		const radius = 0.02 + Math.random() * 0.015;
		assets.push({
			id,
			position: [
				centerLng + Math.cos(angle) * radius,
				centerLat + Math.sin(angle) * radius * 0.8,
			],
			type: "monitoring-station",
			name: `Monitoring Station ${id}`,
			status: "active",
			coverage: 95,
		});
	});

	return assets;
}

function generateWindVectors(
	centerLat: number,
	centerLng: number,
): WindVector[] {
	const vectors: WindVector[] = [];
	for (let i = 0; i < 80; i++) {
		const lng = centerLng + (Math.random() - 0.5) * 0.08;
		const lat = centerLat + (Math.random() - 0.5) * 0.06;
		vectors.push({
			position: [lng, lat],
			direction: 180 + Math.random() * 120,
			speed: 2 + Math.random() * 8,
		});
	}
	return vectors;
}

function buildDirectRoute(
	id: string,
	label: string,
	from: [number, number],
	to: [number, number],
	color: [number, number, number],
): GeneratedRoute {
	const midPoint: [number, number] = [
		(from[0] + to[0]) / 2,
		(from[1] + to[1]) / 2 + 0.01,
	];
	return {
		id,
		label,
		path: [from, midPoint, to],
		color,
		source: "fallback",
	};
}

function getCircleColors(
	score: number,
	mode: "aqi" | "heat" | "noise",
): [number, number, number, number] {
	if (mode === "aqi") {
		if (score > 80) return [220, 38, 38, 220];
		if (score > 60) return [249, 115, 22, 200];
		if (score > 40) return [250, 204, 21, 180];
		if (score > 20) return [34, 197, 94, 160];
		return [16, 185, 129, 140];
	}
	if (mode === "heat") {
		if (score > 80) return [153, 27, 27, 230];
		if (score > 60) return [220, 38, 38, 210];
		if (score > 40) return [234, 88, 12, 190];
		if (score > 20) return [250, 204, 21, 170];
		return [254, 240, 138, 150];
	}
	const inverted = 100 - score;
	if (inverted > 80) return [88, 28, 135, 230];
	if (inverted > 60) return [126, 34, 206, 210];
	if (inverted > 40) return [168, 85, 247, 190];
	if (inverted > 20) return [192, 132, 252, 170];
	return [216, 180, 254, 150];
}

function getCircleRadius(
	score: number,
	mode: "aqi" | "heat" | "noise",
): number {
	const base = mode === "noise" ? 100 - score : score;
	return 30 + base * 1.2;
}

function getAssetColor(
	type: ResponseAsset["type"],
	status: ResponseAsset["status"],
): [number, number, number, number] {
	if (status === "maintenance") return [107, 114, 128, 200];
	if (status === "idle") return [251, 191, 36, 200];
	if (type === "water-tanker") return [59, 130, 246, 230];
	if (type === "air-purifier") return [16, 185, 129, 230];
	return [139, 92, 246, 230];
}

function getWindStreamlineColor(
	speed: number,
): [number, number, number, number] {
	if (speed <= 2) return [103, 232, 249, 150];
	if (speed <= 5) return [165, 243, 252, 160];
	if (speed <= 8) return [252, 211, 77, 175];
	if (speed <= 12) return [249, 115, 22, 185];
	return [239, 68, 68, 195];
}

function getWindStreamlinePath(
	origin: [number, number],
	direction: number,
	speed: number,
): number[][] {
	const rad = (direction * Math.PI) / 180;
	const length = Math.min(speed * 0.003, 0.015);
	const mid: [number, number] = [
		origin[0] + Math.cos(rad) * length * 0.5,
		origin[1] + Math.sin(rad) * length * 0.5,
	];
	const end: [number, number] = [
		origin[0] + Math.cos(rad) * length,
		origin[1] + Math.sin(rad) * length,
	];
	return [origin, mid, end];
}

export function CityMap({
	routeSegments,
	userLocation,
}: {
	routeSegments: RouteSegment[];
	userLocation: [number, number] | null;
}) {
	const [data, setData] = useState<ImpactData[]>([]);
	const [assets, setAssets] = useState<ResponseAsset[]>([]);
	const [windVectors, setWindVectors] = useState<WindVector[]>([]);
	const [greenZones, setGreenZones] = useState<GreenZone[]>([]);
	const [viewState, setViewState] = useState<MapViewState>(INITIAL_VIEW_STATE);
	const [viewMode, setViewMode] = useState<"2d" | "3d">("2d");
	const windPhaseRef = useRef<number>(0);
	const windFrameRef = useRef<number>(0);

	const greenDestination = useEnvStore((s) => s.greenDestination);
	const activeSearchPlace = useEnvStore((s) => s.activeSearchPlace);
	const comparePlaces = useEnvStore((s) => s.comparePlaces);
	const mapFocus = useEnvStore((s) => s.mapFocus);
	const mapOverlay = useEnvStore((s) => s.mapOverlay);
	const setMapZoom = useEnvStore((s) => s.setMapZoom);
	const showProjectionOnMap = useEnvStore((s) => s.showProjectionOnMap);
	const projectionMode = useEnvStore((s) => s.projectionMode);
	const navigationRoutes = useEnvStore((s) => s.navigationRoutes);
	const setClickedHexPosition = useEnvStore((s) => s.setClickedHexPosition);
	const activeInterventions = useEnvStore((s) => s.activeInterventions);
	const showWind = useEnvStore((s) => s.showWind);
	const setShowWind = useEnvStore((s) => s.setShowWind);
	const selectedRouteId = useEnvStore((s) => s.selectedRouteId);

	useEffect(() => {
		if (userLocation) {
			setData(generateLocalImpactData(userLocation[1], userLocation[0]));
			setAssets(generateResponseAssets(userLocation[1], userLocation[0]));
			setGreenZones(generateGreenZones(userLocation[1], userLocation[0]));
		} else {
			setData(generateLocalImpactData(37.74, -122.4));
			setAssets(generateResponseAssets(37.74, -122.4));
			setGreenZones(generateGreenZones(37.74, -122.4));
		}
	}, [userLocation]);

	useEffect(() => {
		if (!userLocation) {
			setWindVectors(generateWindVectors(37.74, -122.4));
			return;
		}

		if (showWind) {
			fetchWindGrid({
				centerLat: userLocation[1],
				centerLng: userLocation[0],
				gridSize: 8,
			})
				.then((windData) => {
					const vectors: WindVector[] = windData.points.map((point) => ({
						position: [point.longitude, point.latitude] as [number, number],
						direction: point.direction,
						speed: point.speed,
					}));
					setWindVectors(vectors);
				})
				.catch(() => {
					setWindVectors(generateWindVectors(userLocation[1], userLocation[0]));
				});
		}
	}, [userLocation, showWind]);

	useEffect(() => {
		if (!showWind || windVectors.length === 0) {
			cancelAnimationFrame(windFrameRef.current);
			return;
		}
		const animate = () => {
			windPhaseRef.current = (windPhaseRef.current + 0.02) % (Math.PI * 2);
			windFrameRef.current = requestAnimationFrame(animate);
		};
		windFrameRef.current = requestAnimationFrame(animate);
		return () => cancelAnimationFrame(windFrameRef.current);
	}, [showWind, windVectors.length]);

	useEffect(() => {
		if (mapFocus === "user" && userLocation) {
			const targetState =
				viewMode === "3d" ? GOV_MODE_VIEW_STATE : INITIAL_VIEW_STATE;
			setViewState({
				...targetState,
				longitude: userLocation[0],
				latitude: userLocation[1],
				zoom: 14,
				transitionDuration: 2200,
				transitionInterpolator: new FlyToInterpolator(),
			});
			return;
		}

		if (mapFocus === "green" && greenDestination) {
			setViewState({
				...INITIAL_VIEW_STATE,
				longitude: greenDestination.coordinates[0],
				latitude: greenDestination.coordinates[1],
				zoom: 15,
				pitch: 60,
				transitionDuration: 3200,
				transitionInterpolator: new FlyToInterpolator(),
			});
			return;
		}

		if (mapFocus === "search" && activeSearchPlace) {
			setViewState({
				...INITIAL_VIEW_STATE,
				longitude: activeSearchPlace.longitude,
				latitude: activeSearchPlace.latitude,
				zoom: 12.8,
				pitch: 52,
				bearing: -8,
				transitionDuration: 2800,
				transitionInterpolator: new FlyToInterpolator(),
			});
			return;
		}

		if (userLocation) {
			const targetState =
				viewMode === "3d" ? GOV_MODE_VIEW_STATE : INITIAL_VIEW_STATE;
			setViewState({
				...targetState,
				longitude: userLocation[0],
				latitude: userLocation[1],
				zoom: 14,
				transitionDuration: 2200,
				transitionInterpolator: new FlyToInterpolator(),
			});
		}
	}, [activeSearchPlace, greenDestination, mapFocus, userLocation, viewMode]);

	const greenMarker: MarkerData[] = greenDestination
		? [
				{
					id: `green-${greenDestination.name}`,
					position: greenDestination.coordinates,
					name: greenDestination.name,
					subtitle: `${greenDestination.distanceKm.toFixed(1)} km away`,
					note: greenDestination.note,
					kind: "green",
				},
			]
		: [];

	const searchMarker: MarkerData[] = activeSearchPlace
		? [
				{
					id: `search-${activeSearchPlace.id}`,
					position: [activeSearchPlace.longitude, activeSearchPlace.latitude],
					name: activeSearchPlace.label,
					subtitle: "Live search target",
					note: "Fly-to enabled for searched places.",
					kind: "search",
				},
			]
		: [];

	const compareMarkers: MarkerData[] = comparePlaces
		.filter((place) => place.id !== activeSearchPlace?.id)
		.map((place) => ({
			id: `compare-${place.id}`,
			position: [place.longitude, place.latitude] as [number, number],
			name: place.label,
			subtitle: "Compare location",
			note: "Pinned for side-by-side environmental comparison.",
			kind: "compare" as const,
		}));

	const routeTargets = useMemo<RouteTarget[]>(() => {
		const targets: RouteTarget[] = [];

		if (activeSearchPlace) {
			targets.push({
				id: `search-${activeSearchPlace.id}`,
				label: activeSearchPlace.label,
				coordinates: [activeSearchPlace.longitude, activeSearchPlace.latitude],
				color: [56, 189, 248],
			});
		}

		if (greenDestination) {
			targets.push({
				id: `green-${greenDestination.name}`,
				label: greenDestination.name,
				coordinates: greenDestination.coordinates,
				color: [16, 185, 129],
			});
		}

		comparePlaces
			.filter((place) => place.id !== activeSearchPlace?.id)
			.forEach((place) => {
				targets.push({
					id: `compare-${place.id}`,
					label: place.label,
					coordinates: [place.longitude, place.latitude],
					color: [251, 191, 36],
				});
			});

		return targets;
	}, [activeSearchPlace, comparePlaces, greenDestination]);

	const routeQueries = useQueries({
		queries: routeTargets.map((target) => ({
			queryKey: [
				"road-route",
				userLocation?.[0],
				userLocation?.[1],
				target.coordinates[0],
				target.coordinates[1],
			],
			enabled: Boolean(userLocation),
			staleTime: 15 * 60 * 1000,
			gcTime: 30 * 60 * 1000,
			retry: 1,
			refetchOnWindowFocus: false,
			queryFn: () => {
				if (!userLocation) {
					throw new Error("User location unavailable for routing.");
				}
				return fetchRoadRoute(
					{ longitude: userLocation[0], latitude: userLocation[1] },
					{ longitude: target.coordinates[0], latitude: target.coordinates[1] },
				);
			},
		})),
	});

	const generatedRoutes = useMemo(() => {
		if (!userLocation) return [] as GeneratedRoute[];

		return routeTargets.map((target, index) => {
			const query = routeQueries[index];
			const roadRoute = query?.data;

			if (roadRoute) {
				return {
					id: `road-${target.id}`,
					label: target.label,
					path: roadRoute.coordinates,
					color: target.color,
					source: roadRoute.source,
					distanceKm: roadRoute.distanceMeters / 1000,
					durationMinutes: roadRoute.durationSeconds / 60,
				};
			}

			return buildDirectRoute(
				`fallback-${target.id}`,
				target.label,
				userLocation,
				target.coordinates,
				target.color,
			);
		});
	}, [routeQueries, routeTargets, userLocation]);

	const combinedRouteSegments = useMemo(
		() => [
			...routeSegments.map((segment, index) => ({
				id: `static-${index}`,
				label: "Static route segment",
				path: segment.path as [number, number][],
				color: segment.color,
				source: "fallback" as const,
			})),
			...generatedRoutes,
		],
		[generatedRoutes, routeSegments],
	);

	const handleClick = useCallback(
		(info: PickingInfo) => {
			if (info.coordinate && info.object && "score" in info.object) {
				setClickedHexPosition({ x: info.x ?? 0, y: info.y ?? 0 });
			}
		},
		[setClickedHexPosition],
	);

	const projectedData = useMemo(() => {
		if (!projectionMode || !showProjectionOnMap) return [];

		function computeSpatialReduction(
			point: ImpactData,
			centerLat: number,
			centerLng: number,
		): number {
			if (activeInterventions.length === 0) return 0;

			let totalReduction = 0;

			for (const intervention of activeInterventions) {
				if (intervention.effect === 0) continue;

				const proportion =
					(intervention.effect / 100) * intervention.maxReduction;

				let spatialFactor = 0.5;

				if (intervention.id === "heavy-vehicles") {
					const distFromCenter = Math.sqrt(
						(point.position[1] - centerLat) ** 2 +
							(point.position[0] - centerLng) ** 2,
					);
					const normalizedDist = distFromCenter / 0.05;
					spatialFactor =
						normalizedDist > 0.6 ? 0.8 : normalizedDist > 0.3 ? 0.6 : 0.4;
					if (point.score < 50) spatialFactor *= 0.2;
				} else if (intervention.id === "construction") {
					spatialFactor = point.score > 60 ? 0.9 : 0.2;
				} else if (intervention.id === "street-misting") {
					spatialFactor = 0.6;
				} else if (intervention.id === "industrial-emissions") {
					const angle =
						Math.atan2(
							point.position[1] - centerLat,
							point.position[0] - centerLng,
						) + Math.PI;
					const quadrant = Math.floor((angle / (Math.PI * 2)) * 4);
					spatialFactor = quadrant === 2 ? 0.9 : 0.3;
				} else if (intervention.id === "public-transit") {
					spatialFactor = 0.55;
				} else if (intervention.id === "staggered-hours") {
					spatialFactor = 0.45;
				}

				totalReduction += proportion * spatialFactor;
			}

			return Math.min(totalReduction, 80);
		}

		const centerLat = data.length > 0 ? data[0].position[1] : 37.74;
		const centerLng = data.length > 0 ? data[0].position[0] : -122.4;

		return data.map((d) => {
			const spatialReduction = computeSpatialReduction(d, centerLat, centerLng);
			const projectedScore = Math.max(
				5,
				Math.min(150, d.score - spatialReduction),
			);
			return {
				...d,
				projectedScore,
				spatialReduction,
			};
		});
	}, [data, projectionMode, showProjectionOnMap, activeInterventions]);

	const windStreamlines = useMemo(() => {
		return windVectors.slice(0, 80).map((v) => ({
			position: v.position,
			path: getWindStreamlinePath(v.position, v.direction, v.speed),
			color: getWindStreamlineColor(v.speed),
			width: 1 + v.speed * 0.3,
		}));
	}, [windVectors]);

	const navigationPathLayers = useMemo(() => {
		// eslint-disable-next-line @typescript-eslint/no-explicit-any
		const layers: any[] = [];

		function getScoreAtCoord(
			coord: [number, number],
			impactData: ImpactData[],
		): number {
			let minDist = Infinity;
			let score = 50;
			for (const d of impactData) {
				const dx = coord[0] - d.position[0];
				const dy = coord[1] - d.position[1];
				const dist = Math.sqrt(dx * dx + dy * dy);
				if (dist < minDist) {
					minDist = dist;
					score = d.score;
				}
			}
			return score;
		}

		function segmentColor(aqi: number): [number, number, number, number] {
			if (aqi > 100)
				return [220, 38, 38, 230] as [number, number, number, number];
			if (aqi > 50)
				return [234, 179, 8, 230] as [number, number, number, number];
			return [34, 197, 94, 230] as [number, number, number, number];
		}

		function buildSegmentedRoute(
			coords: [number, number][],
			routeId: string,
			impactData: ImpactData[],
			isDashed: boolean,
			isBest: boolean,
		) {
			// eslint-disable-next-line @typescript-eslint/no-explicit-any
			const segmentsByColor: Record<string, any> = {};

			for (let i = 0; i < coords.length - 1; i++) {
				const p1 = coords[i];
				const p2 = coords[i + 1];
				const avgScore =
					(getScoreAtCoord(p1, impactData) + getScoreAtCoord(p2, impactData)) /
					2;
				const color = segmentColor(avgScore);
				const key = color.join(",");
				if (!segmentsByColor[key]) {
					segmentsByColor[key] = { path: [], color };
				}
				if (
					segmentsByColor[key].path.length === 0 ||
					segmentsByColor[key].path.at(-1)!.join(",") !== p1.join(",")
				) {
					segmentsByColor[key].path.push(p1);
				}
				segmentsByColor[key].path.push(p2);
			}

			const isHighlighted = selectedRouteId
				? routeId.includes(selectedRouteId)
				: isBest;
			const lineWidth = isHighlighted ? 9 : isDashed ? 3 : 5;
			const lineWidthMax = isHighlighted ? 14 : isDashed ? 5 : 8;
			const opacity = isHighlighted ? 1 : selectedRouteId ? 0.4 : 1;

			Object.entries(segmentsByColor).forEach(([key, seg]) => {
				if (seg.path.length < 2) return;
				const [r, g, b] = seg.color;
				layers.push(
					new PathLayer({
						id: `${routeId}-${key}`,
						data: [{ path: seg.path }],
						pickable: true,
						widthScale: 20,
						widthMinPixels: lineWidth,
						widthMaxPixels: lineWidthMax,
						capRounded: true,
						jointRounded: true,
						getPath: (d) => d.path as [number, number][],
						getColor: [r, g, b, Math.round(230 * opacity)] as [
							number,
							number,
							number,
							number,
						],
						getWidth: lineWidth,
						getDashArray: isDashed ? [8, 4] : null,
					}),
				);
			});
		}

		const fastestAqi = navigationRoutes.fastest?.aqi ?? 999;
		const cleanestAqi = navigationRoutes.cleanest?.aqi ?? 999;
		const bestRouteId = cleanestAqi < fastestAqi ? "cleanest" : "fastest";

		if (navigationRoutes.fastest?.coordinates?.length) {
			const isBest = bestRouteId === "fastest";
			buildSegmentedRoute(
				navigationRoutes.fastest.coordinates,
				"nav-fastest",
				data,
				!isBest,
				isBest,
			);

			const coords = navigationRoutes.fastest.coordinates;
			const start = coords[0];
			const end = coords[coords.length - 1];
			const isHighlighted = selectedRouteId
				? selectedRouteId === "fastest"
				: isBest;
			const markerOpacity = isHighlighted ? 1 : selectedRouteId ? 0.35 : 1;

			layers.push(
				new ScatterplotLayer({
					id: "nav-fastest-start",
					data: [{ position: start }],
					pickable: false,
					opacity: isHighlighted ? 1 : 0.35,
					filled: true,
					stroked: true,
					radiusMinPixels: isHighlighted ? 8 : 6,
					radiusMaxPixels: 12,
					lineWidthMinPixels: isHighlighted ? 2 : 1,
					getPosition: (d) => d.position,
					getFillColor: isBest
						? ([34, 197, 94, 255] as [number, number, number, number])
						: ([249, 115, 22, 255] as [number, number, number, number]),
					getLineColor: [255, 255, 255, Math.round(200 * markerOpacity)] as [
						number,
						number,
						number,
						number,
					],
				}),
			);

			layers.push(
				new ScatterplotLayer({
					id: "nav-fastest-end",
					data: [{ position: end }],
					pickable: false,
					opacity: isHighlighted ? 1 : 0.35,
					filled: true,
					stroked: true,
					radiusMinPixels: isHighlighted ? 6 : 5,
					radiusMaxPixels: 10,
					lineWidthMinPixels: 1,
					getPosition: (d) => d.position,
					getFillColor: isBest
						? ([16, 185, 129, 255] as [number, number, number, number])
						: ([220, 38, 38, 255] as [number, number, number, number]),
					getLineColor: [255, 255, 255, Math.round(200 * markerOpacity)] as [
						number,
						number,
						number,
						number,
					],
				}),
			);
		}

		if (navigationRoutes.cleanest?.coordinates?.length) {
			const isBest = bestRouteId === "cleanest";
			buildSegmentedRoute(
				navigationRoutes.cleanest.coordinates,
				"nav-cleanest",
				data,
				!isBest,
				isBest,
			);

			const coords = navigationRoutes.cleanest.coordinates;
			const start = coords[0];
			const end = coords[coords.length - 1];
			const isHighlighted = selectedRouteId
				? selectedRouteId === "cleanest"
				: isBest;
			const markerOpacity = isHighlighted ? 1 : selectedRouteId ? 0.35 : 1;

			layers.push(
				new ScatterplotLayer({
					id: "nav-cleanest-start",
					data: [{ position: start }],
					pickable: false,
					opacity: isHighlighted ? 1 : 0.35,
					filled: true,
					stroked: true,
					radiusMinPixels: isHighlighted ? 8 : 6,
					radiusMaxPixels: 12,
					lineWidthMinPixels: isHighlighted ? 2 : 1,
					getPosition: (d) => d.position,
					getFillColor: isBest
						? ([34, 197, 94, 255] as [number, number, number, number])
						: ([249, 115, 22, 255] as [number, number, number, number]),
					getLineColor: [255, 255, 255, Math.round(200 * markerOpacity)] as [
						number,
						number,
						number,
						number,
					],
				}),
			);

			layers.push(
				new ScatterplotLayer({
					id: "nav-cleanest-end",
					data: [{ position: end }],
					pickable: false,
					opacity: isHighlighted ? 1 : 0.35,
					filled: true,
					stroked: true,
					radiusMinPixels: isHighlighted ? 6 : 5,
					radiusMaxPixels: 10,
					lineWidthMinPixels: 1,
					getPosition: (d) => d.position,
					getFillColor: isBest
						? ([16, 185, 129, 255] as [number, number, number, number])
						: ([220, 38, 38, 255] as [number, number, number, number]),
					getLineColor: [255, 255, 255, Math.round(200 * markerOpacity)] as [
						number,
						number,
						number,
						number,
					],
				}),
			);
		}

		return layers;
	}, [navigationRoutes, data, selectedRouteId]);

	const layers = useMemo(() => {
		// eslint-disable-next-line @typescript-eslint/no-explicit-any
		const allLayers: any[] = [];

		const isDetailedView = viewState.zoom > 11;
		const visibleData = isDetailedView
			? data
			: data.filter((d) => d.score > 60 || d.score < 30);

		if (showWind) {
			allLayers.push(
				new ScatterplotLayer({
					id: "wind-arrow-layer",
					data: windStreamlines,
					pickable: false,
					opacity: 0.85,
					filled: true,
					radiusMinPixels: 2,
					radiusMaxPixels: 5,
					getPosition: (d) => d.position,
					getFillColor: (d) => d.color,
					getRadius: (d) => 2 + d.width,
				}),
			);
		}

		if (showProjectionOnMap && projectedData.length > 0) {
			allLayers.push(
				new ScatterplotLayer({
					id: "projection-layer",
					data: projectedData,
					pickable: true,
					opacity: 0.9,
					stroked: true,
					filled: true,
					radiusScale: 1,
					radiusMinPixels: 3,
					radiusMaxPixels: 80,
					lineWidthMinPixels: 1,
					getPosition: (datum) => (datum as ImpactData).position,
					getFillColor: (datum) => {
						const proj = (datum as ImpactData).projectedScore ?? 50;
						if (proj > 100)
							return [220, 38, 38, 220] as [number, number, number, number];
						if (proj > 70)
							return [249, 115, 22, 220] as [number, number, number, number];
						if (proj > 50)
							return [234, 179, 8, 220] as [number, number, number, number];
						if (proj > 30)
							return [132, 204, 22, 220] as [number, number, number, number];
						return [16, 185, 129, 220] as [number, number, number, number];
					},
					getLineColor: (datum) => {
						const proj = (datum as ImpactData).projectedScore ?? 50;
						const original = (datum as ImpactData).score ?? 50;
						const improvement = original - proj;
						if (improvement > 25)
							return [16, 185, 129, 230] as [number, number, number, number];
						if (improvement > 15)
							return [132, 204, 22, 210] as [number, number, number, number];
						if (improvement > 5)
							return [234, 179, 8, 200] as [number, number, number, number];
						return [100, 116, 139, 150] as [number, number, number, number];
					},
					getRadius: (datum) =>
						getCircleRadius(
							(datum as ImpactData).projectedScore ?? 50,
							mapOverlay,
						),
					transitions: {
						getFillColor: { duration: 600 },
						getRadius: { duration: 600 },
						getLineColor: { duration: 600 },
					},
					onClick: handleClick,
				}),
			);
		} else {
			allLayers.push(
				new ScatterplotLayer<ImpactData>({
					id: "impact-circles-layer",
					data: visibleData,
					pickable: true,
					opacity: 0.7,
					stroked: true,
					filled: true,
					radiusScale: 1,
					radiusMinPixels: 3,
					radiusMaxPixels: 60,
					lineWidthMinPixels: 1,
					getPosition: (datum) => datum.position,
					getFillColor: (datum) =>
						getCircleColors(datum.score, mapOverlay) as [
							number,
							number,
							number,
							number,
						],
					getLineColor: [255, 255, 255, 40],
					getRadius: (datum) => getCircleRadius(datum.score, mapOverlay),
					transitions: {
						getRadius: { duration: 1000, type: "spring" },
						getFillColor: { duration: 800 },
					},
					onClick: handleClick,
				}),
			);
		}

		if (data.some((d) => d.trend === "rising" && d.score > 70)) {
			allLayers.push(
				new ScatterplotLayer<ImpactData>({
					id: "risk-pulse-layer",
					data: data.filter((d) => d.trend === "rising" && d.score > 70),
					pickable: false,
					opacity: 0.4,
					filled: true,
					radiusMinPixels: 4,
					radiusMaxPixels: 80,
					getPosition: (datum) => datum.position,
					getFillColor: [239, 68, 68, 0],
					getRadius: (datum) => getCircleRadius(datum.score, mapOverlay) * 1.5,
					transitions: {
						getRadius: {
							duration: 2000,
							type: "spring",
							damping: 0.4,
							stiffness: 0.1,
						},
						opacity: { duration: 1000 },
					},
				}),
			);
		}

		allLayers.push(
			new PathLayer<GeneratedRoute>({
				id: "route-overlay-layer",
				data: combinedRouteSegments,
				pickable: true,
				widthScale: 20,
				widthMinPixels: 3,
				capRounded: true,
				jointRounded: true,
				getPath: (route) => route.path,
				getColor: (route) => route.color,
				getWidth: (route) => (route.source === "road" ? 5 : 4),
			}),
		);

		if (userLocation) {
			allLayers.push(
				new ScatterplotLayer<PositionDatum>({
					id: "user-location-pulse",
					data: [{ position: userLocation }],
					pickable: false,
					opacity: 0.8,
					stroked: true,
					filled: true,
					radiusScale: 1,
					radiusMinPixels: 1,
					radiusMaxPixels: 1000,
					lineWidthMinPixels: 2,
					getPosition: (datum) => datum.position,
					getFillColor: [16, 185, 129, 60],
					getLineColor: [16, 185, 129, 255],
					getRadius: 300,
					transitions: {
						getRadius: {
							duration: 2000,
							type: "spring",
							damping: 0.5,
							stiffness: 0.1,
						},
					},
				}),
			);

			allLayers.push(
				new ScatterplotLayer<PositionDatum>({
					id: "user-location-dot",
					data: [{ position: userLocation }],
					pickable: false,
					opacity: 1,
					filled: true,
					radiusMinPixels: 4,
					getPosition: (datum) => datum.position,
					getFillColor: [16, 185, 129, 255],
					getRadius: 10,
				}),
			);
		}

		if (greenMarker.length) {
			allLayers.push(
				new ScatterplotLayer<MarkerData>({
					id: "green-marker",
					data: greenMarker,
					pickable: true,
					opacity: 1,
					stroked: true,
					filled: true,
					radiusScale: 1,
					radiusMinPixels: 8,
					radiusMaxPixels: 100,
					lineWidthMinPixels: 3,
					getPosition: (datum) => datum.position,
					getFillColor: [16, 185, 129, 255],
					getLineColor: [255, 255, 255, 255],
					getRadius: 80,
				}),
			);

			allLayers.push(
				new ScatterplotLayer<MarkerData>({
					id: "green-pulse",
					data: greenMarker,
					pickable: false,
					opacity: 0.4,
					filled: true,
					getPosition: (datum) => datum.position,
					getFillColor: [16, 185, 129, 100],
					getRadius: 400,
					transitions: {
						getRadius: {
							duration: 2000,
							type: "spring",
							damping: 0.5,
							stiffness: 0.1,
						},
					},
				}),
			);
		}

		if (searchMarker.length) {
			allLayers.push(
				new ScatterplotLayer<MarkerData>({
					id: "search-marker",
					data: searchMarker,
					pickable: true,
					opacity: 1,
					stroked: true,
					filled: true,
					radiusScale: 1,
					radiusMinPixels: 7,
					radiusMaxPixels: 90,
					lineWidthMinPixels: 3,
					getPosition: (datum) => datum.position,
					getFillColor: [56, 189, 248, 255],
					getLineColor: [255, 255, 255, 220],
					getRadius: 74,
				}),
			);

			allLayers.push(
				new ScatterplotLayer<MarkerData>({
					id: "search-pulse",
					data: searchMarker,
					pickable: false,
					opacity: 0.3,
					filled: true,
					getPosition: (datum) => datum.position,
					getFillColor: [56, 189, 248, 110],
					getRadius: 520,
					transitions: {
						getRadius: {
							duration: 1800,
							type: "spring",
							damping: 0.5,
							stiffness: 0.1,
						},
					},
				}),
			);
		}

		if (compareMarkers.length) {
			allLayers.push(
				new ScatterplotLayer<MarkerData>({
					id: "compare-markers",
					data: compareMarkers,
					pickable: true,
					opacity: 0.95,
					stroked: true,
					filled: true,
					radiusScale: 1,
					radiusMinPixels: 6,
					radiusMaxPixels: 70,
					lineWidthMinPixels: 2,
					getPosition: (datum) => datum.position,
					getFillColor: [251, 191, 36, 230],
					getLineColor: [255, 248, 220, 180],
					getRadius: 55,
				}),
			);
		}

		if (greenZones.length) {
			allLayers.push(
				new ScatterplotLayer<GreenZone>({
					id: "green-zones",
					data: greenZones,
					pickable: true,
					opacity: 0.55,
					stroked: true,
					filled: true,
					radiusScale: 1,
					radiusMinPixels: 30,
					radiusMaxPixels: 150,
					lineWidthMinPixels: 2,
					getPosition: (datum) => datum.position,
					getFillColor: [16, 185, 129, 80],
					getLineColor: [16, 185, 129, 200],
					getRadius: (datum) => datum.radius * 10000,
				}),
			);
		}

		if (viewMode === "3d") {
			allLayers.push(
				new ColumnLayer<ImpactData>({
					id: "3d-smog-pillars",
					data,
					diskResolution: 12,
					radius: 120,
					extruded: true,
					pickable: true,
					elevationScale: 1,
					getPosition: (datum) => datum.position,
					getFillColor: (datum) =>
						getCircleColors(datum.score, mapOverlay) as [
							number,
							number,
							number,
							number,
						],
					getElevation: (datum) => 100 + datum.score * 8,
					transitions: {
						getElevation: { duration: 1200, type: "spring" },
						getFillColor: { duration: 800 },
					},
				}),
			);
		}

		if (assets.length > 0) {
			allLayers.push(
				new ScatterplotLayer<ResponseAsset>({
					id: "response-assets",
					data: assets,
					pickable: true,
					opacity: 1,
					stroked: true,
					filled: true,
					radiusScale: 1,
					radiusMinPixels: 12,
					radiusMaxPixels: 40,
					lineWidthMinPixels: 2,
					getPosition: (datum) => datum.position,
					getFillColor: (datum) =>
						getAssetColor(datum.type, datum.status) as [
							number,
							number,
							number,
							number,
						],
					getLineColor: (datum) =>
						datum.status === "active"
							? [255, 255, 255, 255]
							: [255, 255, 255, 80],
					getRadius: (datum) =>
						datum.type === "water-tanker"
							? 35
							: datum.type === "air-purifier"
								? 28
								: 20,
				}),
			);
		}

		allLayers.push(...navigationPathLayers);

		return allLayers;
	}, [
		assets,
		combinedRouteSegments,
		compareMarkers,
		data,
		greenMarker,
		greenZones,
		handleClick,
		mapOverlay,
		navigationPathLayers,
		projectedData,
		searchMarker,
		showProjectionOnMap,
		showWind,
		userLocation,
		viewMode,
		viewState,
		windStreamlines,
	]);

	const tooltipRenderer = ({
		object,
	}: PickingInfo<ImpactData | MarkerData | GeneratedRoute | GreenZone>) => {
		if (object && "score" in object && object.score != null) {
			const modeLabel =
				mapOverlay === "aqi"
					? "AQI Score"
					: mapOverlay === "heat"
						? "Heat Index"
						: "Noise Level";
			const displayValue =
				mapOverlay === "noise"
					? Math.round(100 - object.score)
					: Math.round(object.score);
			const trendLabel =
				"trend" in object
					? object.trend === "rising"
						? "Rising"
						: object.trend === "falling"
							? "Falling"
							: "Stable"
					: null;
			return {
				html: `<div style="background:#09090b;border:1px solid #27272a;padding:12px 16px;border-radius:12px;font-family:monospace;color:#fff"><p style="font-size:10px;color:#71717a;margin:0 0 4px;text-transform:uppercase;">${modeLabel}${trendLabel ? ` — ${trendLabel}` : ""}</p><p style="font-size:28px;font-weight:900;margin:0;color:${object.score > 75 ? "#ef4444" : object.score > 50 ? "#f97316" : "#22c55e"}">${displayValue}</p></div>`,
				style: { background: "transparent", padding: "0", border: "none" },
			};
		}

		if (object && "name" in object) {
			const markerLabel =
				"kind" in object && object.kind === "green"
					? "Clean zone"
					: "kind" in object && object.kind === "search"
						? "Search focus"
						: "Compare point";
			const subtitle =
				"subtitle" in object
					? object.subtitle
					: `AQI ${Math.round((object as GreenZone).score)}`;
			const note = "note" in object ? object.note : "Clean air refuge zone";
			const color =
				"kind" in object
					? object.kind === "green"
						? "#86efac"
						: object.kind === "search"
							? "#7dd3fc"
							: "#fcd34d"
					: "#86efac";
			return {
				html: `<div style="background:#09090b;border:1px solid #27272a;padding:12px 16px;border-radius:12px;font-family:monospace;color:#fff;max-width:240px;"><p style="font-size:10px;color:#71717a;margin:0 0 4px;text-transform:uppercase;">${markerLabel}</p><p style="font-size:16px;font-weight:700;margin:0 0 6px;">${object.name}</p><p style="font-size:12px;color:${color};margin:0 0 4px;">${subtitle}</p><p style="font-size:11px;line-height:1.4;margin:0;color:#d4d4d8;">${note}</p></div>`,
				style: { background: "transparent", padding: "0", border: "none" },
			};
		}

		if (object && "path" in object) {
			const routeMeta =
				object.distanceKm != null && object.durationMinutes != null
					? `${object.distanceKm.toFixed(1)} km | ${Math.round(object.durationMinutes)} min`
					: object.source === "road"
						? "Road route loaded"
						: "Loading road route";
			return {
				html: `<div style="background:#09090b;border:1px solid #27272a;padding:12px 16px;border-radius:12px;font-family:monospace;color:#fff;max-width:240px;"><p style="font-size:10px;color:#71717a;margin:0 0 4px;text-transform:uppercase;">Route overlay</p><p style="font-size:15px;font-weight:700;margin:0 0 6px;">${object.label}</p><p style="font-size:12px;color:${object.source === "road" ? "#86efac" : "#facc15"};margin:0;">${routeMeta}</p></div>`,
				style: { background: "transparent", padding: "0", border: "none" },
			};
		}

		return null;
	};

	return (
		<div className="relative h-full min-h-screen w-full">
			<div className="absolute left-4 top-20 z-10 flex flex-col gap-2">
				<button
					type="button"
					onClick={() => {
						const setMapFocus = useEnvStore.getState().setMapFocus;
						setMapFocus("user");
					}}
					className="flex items-center gap-2 rounded-xl border border-white/10 bg-black/60 px-3 py-2.5 text-xs font-bold text-zinc-300 backdrop-blur-md transition-all hover:border-emerald-500/50 hover:bg-emerald-500/10 hover:text-emerald-300"
					title="Center on my location"
				>
					<svg
						className="h-3.5 w-3.5 text-emerald-400"
						viewBox="0 0 24 24"
						fill="none"
						stroke="currentColor"
						strokeWidth="2"
						aria-hidden="true"
					>
						<circle cx="12" cy="12" r="3" />
						<path d="M12 2v3M12 19v3M2 12h3M19 12h3" />
					</svg>
					My Location
				</button>
				<button
					type="button"
					onClick={() => setViewMode(viewMode === "2d" ? "3d" : "2d")}
					className={`flex items-center gap-2 rounded-xl border px-3 py-2.5 text-xs font-bold transition-all ${
						viewMode === "3d"
							? "border-amber-500/50 bg-amber-500/20 text-amber-300 shadow-lg shadow-amber-500/20"
							: "border-white/10 bg-black/60 text-zinc-300 backdrop-blur-md hover:bg-white/10"
					}`}
				>
					<span
						className={`h-2 w-2 rounded-full ${viewMode === "3d" ? "bg-amber-400 animate-pulse" : "bg-zinc-500"}`}
					/>
					{viewMode === "3d" ? "3D Pillars" : "2D View"}
				</button>
				<button
					type="button"
					onClick={() => setShowWind(!showWind)}
					className={`flex items-center gap-2 rounded-xl border px-3 py-2.5 text-xs font-bold transition-all ${
						showWind
							? "border-sky-500/50 bg-sky-500/20 text-sky-300 shadow-lg shadow-sky-500/20"
							: "border-white/10 bg-black/60 text-zinc-300 backdrop-blur-md hover:bg-white/10"
					}`}
				>
					<svg
						className="h-3.5 w-3.5"
						viewBox="0 0 24 24"
						fill="none"
						stroke="currentColor"
						strokeWidth="2"
						aria-hidden="true"
					>
						<path d="M9.59 4.59A2 2 0 1 1 11 8H2m10.59 11.41A2 2 0 1 0 14 16H2m15.73-8.27A2.5 2.5 0 1 1 19.5 12H2" />
					</svg>
					{showWind ? "Hide Wind" : "Show Wind"}
				</button>
				{showProjectionOnMap && (
					<div className="flex flex-col gap-1 rounded-xl border border-emerald-500/40 bg-black/70 px-3 py-2 backdrop-blur-md">
						<div className="flex items-center justify-between">
							<div className="flex items-center gap-1.5">
								<div
									className={`h-1.5 w-1.5 rounded-full ${
										activeInterventions.some((i) => i.effect > 0)
											? "bg-emerald-400 animate-pulse"
											: "bg-amber-400"
									}`}
								/>
								<span className="text-[10px] font-bold text-zinc-300">
									{activeInterventions.some((i) => i.effect > 0)
										? "Policy Impact"
										: "Projection Ready"}
								</span>
							</div>
							{activeInterventions.some((i) => i.effect > 0) && (
								<span className="text-[10px] font-black text-emerald-400">
									-
									{Math.round(
										activeInterventions.reduce(
											(sum, i) => sum + (i.effect / 100) * i.maxReduction,
											0,
										),
									)}{" "}
									AQI
								</span>
							)}
						</div>
						{activeInterventions.some((i) => i.effect > 0) ? (
							<>
								<div className="h-1 w-full overflow-hidden rounded-full bg-white/10">
									<div
										className="h-full rounded-full bg-gradient-to-r from-emerald-600 via-emerald-400 to-lime-400 transition-all duration-500"
										style={{
											width: `${Math.min(100, Math.round((activeInterventions.reduce((sum, i) => sum + (i.effect / 100) * i.maxReduction, 0) / 80) * 100))}%`,
										}}
									/>
								</div>
								<div className="flex items-center gap-1.5">
									<div className="h-1.5 w-3 rounded-sm bg-red-500/80" />
									<div className="h-1.5 w-3 rounded-sm bg-yellow-500/80" />
									<div className="h-1.5 w-3 rounded-sm bg-emerald-500/80" />
									<span className="ml-1 text-[9px] text-zinc-500">
										High → Low after policy
									</span>
								</div>
							</>
						) : (
							<p className="text-[9px] text-zinc-500">
								Adjust sliders in Policy Simulator
							</p>
						)}
					</div>
				)}
			</div>

			{viewMode === "3d" && (
				<div className="absolute right-4 top-20 z-10 flex flex-col gap-1 rounded-xl border border-white/10 bg-black/70 p-2 backdrop-blur-md">
					<p className="px-1 text-[9px] font-bold uppercase tracking-wider text-zinc-500">
						Pillar Height
					</p>
					<div className="flex items-center gap-2">
						<div className="h-10 w-3 rounded-sm bg-emerald-500/80" />
						<span className="text-[10px] text-zinc-400">Good (0-50)</span>
					</div>
					<div className="flex items-center gap-2">
						<div className="h-10 w-3 rounded-sm bg-yellow-500/80" />
						<span className="text-[10px] text-zinc-400">Moderate</span>
					</div>
					<div className="flex items-center gap-2">
						<div className="h-10 w-3 rounded-sm bg-orange-500/80" />
						<span className="text-[10px] text-zinc-400">Unhealthy</span>
					</div>
					<div className="flex items-center gap-2">
						<div className="h-10 w-3 rounded-sm bg-red-500/80" />
						<span className="text-[10px] text-zinc-400">Hazardous</span>
					</div>
				</div>
			)}

			<DeckGL
				viewState={viewState}
				// @ts-expect-error deck.gl viewState type
				onViewStateChange={({ viewState: vs }: { viewState: MapViewState }) => {
					setViewState(vs);
					setMapZoom(vs.zoom ?? 11);
				}}
				controller={true}
				layers={layers}
				effects={[lightingEffect]}
				getTooltip={tooltipRenderer}
			>
				<MapLibreMap mapStyle="https://basemaps.cartocdn.com/gl/dark-matter-gl-style/style.json" />
			</DeckGL>
		</div>
	);
}
