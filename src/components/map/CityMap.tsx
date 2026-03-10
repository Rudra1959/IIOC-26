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
	for (let i = 0; i < 60; i++) {
		const lat = centerLat + (Math.random() - 0.5) * 0.03;
		const lng = centerLng + (Math.random() - 0.5) * 0.03;
		const dist = Math.sqrt((lat - centerLat) ** 2 + (lng - centerLng) ** 2);
		const score = Math.max(
			5,
			Math.min(95, Math.round(40 + Math.random() * 45 - dist * 1500)),
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

	const layers = useMemo(
		() => [
			new ScatterplotLayer<ImpactData>({
				id: "impact-circles-layer",
				data,
				pickable: true,
				opacity: 0.8,
				stroked: true,
				filled: true,
				radiusScale: 1,
				radiusMinPixels: 5,
				radiusMaxPixels: 100,
				lineWidthMinPixels: 2,
				getPosition: (datum) => datum.position,
				getFillColor: (datum) => {
					const score = datum.score;
					if (score > 75) return [255, 50, 50, 200];
					if (score > 50) return [255, 165, 0, 180];
					if (score > 25) return [255, 220, 0, 150];
					return [50, 200, 80, 150];
				},
				getLineColor: [255, 255, 255, 60],
				getRadius: 150,
				transitions: {
					getRadius: { duration: 1000, type: "spring" },
					getFillColor: { duration: 1000 },
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
		],
		[
			combinedRouteSegments,
			compareMarkers,
			data,
			greenMarker,
			searchMarker,
			userLocation,
		],
	);

	const tooltipRenderer = ({
		object,
	}: PickingInfo<ImpactData | MarkerData | GeneratedRoute>) => {
		if (object && "score" in object && object.score != null) {
			return {
				html: `<div style="background:#09090b;border:1px solid #27272a;padding:12px 16px;border-radius:12px;font-family:monospace;color:#fff"><p style="font-size:10px;color:#71717a;margin:0 0 4px;text-transform:uppercase;">Impact Metric</p><p style="font-size:28px;font-weight:900;margin:0;color:${object.score > 75 ? "#ef4444" : object.score > 50 ? "#f97316" : "#22c55e"}">${Math.round(object.score)}</p></div>`,
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
