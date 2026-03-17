import type { MapViewState, PickingInfo } from "@deck.gl/core";
import {
	AmbientLight,
	FlyToInterpolator,
	LightingEffect,
	PointLight,
} from "@deck.gl/core";
import { PathLayer, ScatterplotLayer } from "@deck.gl/layers";
import DeckGL from "@deck.gl/react";
import { useQueries } from "@tanstack/react-query";
import { useEffect, useMemo, useState } from "react";
import { Map as MapLibreMap } from "react-map-gl/maplibre";
import "maplibre-gl/dist/maplibre-gl.css";
import { fetchRoadRoute } from "../../lib/routing";
import { useEnvStore } from "../../store/envStore";

const INITIAL_VIEW_STATE: MapViewState = {
	longitude: -122.4,
	latitude: 37.74,
	zoom: 11,
	pitch: 55,
	bearing: -15,
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

interface ImpactData {
	id: string;
	position: [number, number];
	score: number;
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

export interface RouteSegment {
	path: number[][];
	score: number;
	color: [number, number, number];
}

function generateLocalImpactData(
	centerLat: number,
	centerLng: number,
): ImpactData[] {
	const points: ImpactData[] = [];
	for (let i = 0; i < 400; i++) {
		const angle = Math.random() * Math.PI * 2;
		const radius = Math.random() * 0.04;
		const lat = centerLat + Math.cos(angle) * radius;
		const lng = centerLng + Math.sin(angle) * radius * 1.3;
		const dist = Math.sqrt((lat - centerLat) ** 2 + (lng - centerLng) ** 2);
		const score = Math.max(
			5,
			Math.min(95, Math.round(40 + Math.random() * 50 - dist * 1200)),
		);
		points.push({ id: `impact-${i}`, position: [lng, lat], score });
	}
	return points;
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

// Color schemes for different overlay modes
function getCircleColors(
	score: number,
	mode: "aqi" | "heat" | "noise",
): [number, number, number, number] {
	if (mode === "aqi") {
		if (score > 80) return [220, 38, 38, 220]; // Red
		if (score > 60) return [249, 115, 22, 200]; // Orange
		if (score > 40) return [250, 204, 21, 180]; // Yellow
		if (score > 20) return [34, 197, 94, 160]; // Green
		return [16, 185, 129, 140]; // Emerald
	}
	if (mode === "heat") {
		if (score > 80) return [153, 27, 27, 230]; // Dark red
		if (score > 60) return [220, 38, 38, 210]; // Red
		if (score > 40) return [234, 88, 12, 190]; // Orange
		if (score > 20) return [250, 204, 21, 170]; // Yellow
		return [254, 240, 138, 150]; // Light yellow
	}
	// noise
	const inverted = 100 - score;
	if (inverted > 80) return [88, 28, 135, 230]; // Deep purple
	if (inverted > 60) return [126, 34, 206, 210]; // Purple
	if (inverted > 40) return [168, 85, 247, 190]; // Violet
	if (inverted > 20) return [192, 132, 252, 170]; // Light violet
	return [216, 180, 254, 150]; // Pale lavender
}

function getCircleRadius(score: number, mode: "aqi" | "heat" | "noise"): number {
	const base = mode === "noise" ? 100 - score : score;
	return 80 + base * 2.5;
}

export function CityMap({
	routeSegments,
	userLocation,
}: {
	routeSegments: RouteSegment[];
	userLocation: [number, number] | null;
}) {
	const [data, setData] = useState<ImpactData[]>([]);
	const [viewState, setViewState] = useState<MapViewState>(INITIAL_VIEW_STATE);

	const greenDestination = useEnvStore((s) => s.greenDestination);
	const activeSearchPlace = useEnvStore((s) => s.activeSearchPlace);
	const comparePlaces = useEnvStore((s) => s.comparePlaces);
	const mapFocus = useEnvStore((s) => s.mapFocus);
	const mapOverlay = useEnvStore((s) => s.mapOverlay);

	useEffect(() => {
		if (userLocation) {
			setData(generateLocalImpactData(userLocation[1], userLocation[0]));
		} else {
			setData(generateLocalImpactData(37.74, -122.4));
		}
	}, [userLocation]);

	useEffect(() => {
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
			setViewState({
				...INITIAL_VIEW_STATE,
				longitude: userLocation[0],
				latitude: userLocation[1],
				zoom: 14,
				transitionDuration: 2200,
				transitionInterpolator: new FlyToInterpolator(),
			});
		}
	}, [activeSearchPlace, greenDestination, mapFocus, userLocation]);

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
		if (!userLocation) {
			return [] as GeneratedRoute[];
		}

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

	const layers = useMemo(() => {
		return [
			// Main AQI/Heat/Noise circles — outer glow ring for hotspots
			new ScatterplotLayer<ImpactData>({
				id: "impact-glow-layer",
				data: data.filter((d) => {
					const s = mapOverlay === "noise" ? 100 - d.score : d.score;
					return s > 60;
				}),
				pickable: false,
				opacity: 0.25,
				filled: true,
				radiusScale: 1,
				radiusMinPixels: 8,
				radiusMaxPixels: 200,
				getPosition: (datum) => datum.position,
				getFillColor: (datum) =>
					getCircleColors(datum.score, mapOverlay) as unknown as [
						number,
						number,
						number,
						number,
					],
				getRadius: (datum) => getCircleRadius(datum.score, mapOverlay) * 1.8,
				transitions: {
					getRadius: { duration: 1500, type: "spring" },
					getFillColor: { duration: 800 },
				},
			}),
			// Main circles
			new ScatterplotLayer<ImpactData>({
				id: "impact-circles-layer",
				data,
				pickable: true,
				opacity: 0.75,
				stroked: true,
				filled: true,
				radiusScale: 1,
				radiusMinPixels: 4,
				radiusMaxPixels: 120,
				lineWidthMinPixels: 1,
				getPosition: (datum) => datum.position,
				getFillColor: (datum) =>
					getCircleColors(datum.score, mapOverlay) as unknown as [
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
			}),
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
			...(userLocation
				? [
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
					]
				: []),
			...(greenMarker.length
				? [
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
					]
				: []),
			...(searchMarker.length
				? [
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
					]
				: []),
			...(compareMarkers.length
				? [
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
					]
				: []),
		];
	}, [
		combinedRouteSegments,
		compareMarkers,
		data,
		greenMarker,
		mapOverlay,
		searchMarker,
		userLocation,
	]);

	const tooltipRenderer = ({
		object,
	}: PickingInfo<ImpactData | MarkerData | GeneratedRoute>) => {
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
			return {
				html: `<div style="background:#09090b;border:1px solid #27272a;padding:12px 16px;border-radius:12px;font-family:monospace;color:#fff"><p style="font-size:10px;color:#71717a;margin:0 0 4px;text-transform:uppercase;">${modeLabel}</p><p style="font-size:28px;font-weight:900;margin:0;color:${object.score > 75 ? "#ef4444" : object.score > 50 ? "#f97316" : "#22c55e"}">${displayValue}</p></div>`,
				style: { background: "transparent", padding: "0", border: "none" },
			};
		}

		if (object && "name" in object) {
			const markerLabel =
				object.kind === "green"
					? "Clean zone"
					: object.kind === "search"
						? "Search focus"
						: "Compare point";
			return {
				html: `<div style="background:#09090b;border:1px solid #27272a;padding:12px 16px;border-radius:12px;font-family:monospace;color:#fff;max-width:240px;"><p style="font-size:10px;color:#71717a;margin:0 0 4px;text-transform:uppercase;">${markerLabel}</p><p style="font-size:16px;font-weight:700;margin:0 0 6px;">${object.name}</p><p style="font-size:12px;color:${object.kind === "green" ? "#86efac" : object.kind === "search" ? "#7dd3fc" : "#fcd34d"};margin:0 0 4px;">${object.subtitle}</p><p style="font-size:11px;line-height:1.4;margin:0;color:#d4d4d8;">${object.note}</p></div>`,
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
			<DeckGL
				viewState={viewState}
				onViewStateChange={({ viewState: nextViewState }) =>
					setViewState(nextViewState as MapViewState)
				}
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
