import { UserButton, useUser } from "@clerk/clerk-react";
import { createFileRoute, useNavigate } from "@tanstack/react-router";
import {
	lazy,
	Suspense,
	useCallback,
	useEffect,
	useMemo,
	useState,
} from "react";
import { ModeSwitcher } from "#/components/dashboard/ModeSwitcher";
import { TopWidgetBar } from "#/components/dashboard/TopWidgetBar";
import type { RouteSegment } from "#/components/map/CityMap";
import { calculateAlternativeRoutes } from "#/lib/route-optimizer";
import { useEnvStore } from "#/store/envStore";
import { useFeatureStore } from "#/store/featureStore";

const GlobalRankModal = lazy(() =>
	import("#/components/dashboard/modals/GlobalRankModal").then((m) => ({
		default: m.GlobalRankModal,
	})),
);
const AirPassportModal = lazy(() =>
	import("#/components/dashboard/modals/AirPassportModal").then((m) => ({
		default: m.AirPassportModal,
	})),
);
const CityAirDuelModal = lazy(() =>
	import("#/components/dashboard/modals/CityAirDuelModal").then((m) => ({
		default: m.CityAirDuelModal,
	})),
);
const LungSimulatorModal = lazy(() =>
	import("#/components/dashboard/modals/LungSimulatorModal").then((m) => ({
		default: m.LungSimulatorModal,
	})),
);
const BodyXRayModal = lazy(() =>
	import("#/components/dashboard/modals/BodyXRayModal").then((m) => ({
		default: m.BodyXRayModal,
	})),
);
const HospitalNetworkModal = lazy(() =>
	import("#/components/dashboard/modals/HospitalNetworkModal").then((m) => ({
		default: m.HospitalNetworkModal,
	})),
);
const TimeMachineModal = lazy(() =>
	import("#/components/dashboard/modals/TimeMachineModal").then((m) => ({
		default: m.TimeMachineModal,
	})),
);
const RadarModal = lazy(() =>
	import("#/components/dashboard/modals/RadarModal").then((m) => ({
		default: m.RadarModal,
	})),
);
const GhostCitiesModal = lazy(() =>
	import("#/components/dashboard/modals/GhostCitiesModal").then((m) => ({
		default: m.GhostCitiesModal,
	})),
);
const PollutionDNAModal = lazy(() =>
	import("#/components/dashboard/modals/PollutionDNAModal").then((m) => ({
		default: m.PollutionDNAModal,
	})),
);
const AqiMarketModal = lazy(() =>
	import("#/components/dashboard/modals/AqiMarketModal").then((m) => ({
		default: m.AqiMarketModal,
	})),
);
const CarbonTrackerModal = lazy(() =>
	import("#/components/dashboard/modals/CarbonTrackerModal").then((m) => ({
		default: m.CarbonTrackerModal,
	})),
);
const CitizenReportModal = lazy(() =>
	import("#/components/dashboard/modals/CitizenReportModal").then((m) => ({
		default: m.CitizenReportModal,
	})),
);
const CommunityLeaderboardModal = lazy(() =>
	import("#/components/dashboard/modals/CommunityLeaderboardModal").then(
		(m) => ({
			default: m.CommunityLeaderboardModal,
		}),
	),
);
const PollutionNewsModal = lazy(() =>
	import("#/components/dashboard/modals/PollutionNewsModal").then((m) => ({
		default: m.PollutionNewsModal,
	})),
);
const AqiMusicModal = lazy(() =>
	import("#/components/dashboard/modals/AqiMusicModal").then((m) => ({
		default: m.AqiMusicModal,
	})),
);
const AIOracleModal = lazy(() =>
	import("#/components/dashboard/modals/AIOracleModal").then((m) => ({
		default: m.AIOracleModal,
	})),
);
const ChemLabModal = lazy(() =>
	import("#/components/dashboard/modals/ChemLabModal").then((m) => ({
		default: m.ChemLabModal,
	})),
);
const SatelliteDecodeModal = lazy(() =>
	import("#/components/dashboard/modals/SatelliteDecodeModal").then((m) => ({
		default: m.SatelliteDecodeModal,
	})),
);
const AIAssistantModal = lazy(() =>
	import("#/components/dashboard/modals/AIAssistantModal").then((m) => ({
		default: m.AIAssistantModal,
	})),
);
const CityBuilderModal = lazy(() =>
	import("#/components/dashboard/modals/CityBuilderModal").then((m) => ({
		default: m.CityBuilderModal,
	})),
);
const AQIQuestModal = lazy(() =>
	import("#/components/dashboard/modals/AQIQuestModal").then((m) => ({
		default: m.AQIQuestModal,
	})),
);

const CityMap = lazy(() =>
	import("#/components/map/CityMap").then((module) => ({
		default: module.CityMap,
	})),
);
const CitizenView = lazy(() =>
	import("#/components/dashboard/CitizenView").then((module) => ({
		default: module.CitizenView,
	})),
);
const GovView = lazy(() =>
	import("#/components/dashboard/GovView").then((module) => ({
		default: module.GovView,
	})),
);
const SmartAlerts = lazy(() =>
	import("#/components/dashboard/SmartAlerts").then((module) => ({
		default: module.SmartAlerts,
	})),
);
const PolicySimulator = lazy(() =>
	import("#/components/dashboard/PolicySimulator").then((module) => ({
		default: module.PolicySimulator,
	})),
);
const HexagonDetailPanel = lazy(() =>
	import("#/components/dashboard/HexagonDetailPanel").then((module) => ({
		default: module.HexagonDetailPanel,
	})),
);
const BreatheSafeNavigation = lazy(() =>
	import("#/components/dashboard/BreatheSafeNavigation").then((module) => ({
		default: module.BreatheSafeNavigation,
	})),
);
const ChronosScrubber = lazy(() =>
	import("#/components/dashboard/ChronosScrubber").then((module) => ({
		default: module.ChronosScrubber,
	})),
);
const ThreatAttribution = lazy(() =>
	import("#/components/dashboard/ThreatAttribution").then((module) => ({
		default: module.ThreatAttribution,
	})),
);
const CommandTerminal = lazy(() =>
	import("#/components/dashboard/CommandTerminal").then((module) => ({
		default: module.CommandTerminal,
	})),
);
const CompareView = lazy(() =>
	import("#/components/dashboard/CompareView").then((module) => ({
		default: module.CompareView,
	})),
);
const AudioToggle = lazy(() =>
	import("#/components/dashboard/AudioToggle").then((module) => ({
		default: module.AudioToggle,
	})),
);
const RoutePlanner = lazy(() =>
	import("#/components/dashboard/RoutePlanner").then((module) => ({
		default: module.RoutePlanner,
	})),
);
const UserProfileModal = lazy(() =>
	import("#/components/dashboard/UserProfileModal").then((module) => ({
		default: module.UserProfileModal,
	})),
);

export const Route = createFileRoute("/dashboard")({
	component: DashboardPage,
});

function OverlaySkeleton() {
	return (
		<div className="pointer-events-none absolute inset-0 z-10">
			<div className="absolute bottom-4 right-4 h-[520px] w-[440px] rounded-3xl border border-white/10 bg-black/30 backdrop-blur-2xl" />
			<div className="absolute top-20 right-4 h-[340px] w-96 rounded-3xl border border-white/10 bg-black/20 backdrop-blur-2xl" />
			<div className="absolute top-20 left-4 h-14 w-14 rounded-2xl border border-white/10 bg-black/20 backdrop-blur-xl" />
		</div>
	);
}

function MapSkeleton() {
	return (
		<div className="absolute inset-0 z-0 overflow-hidden bg-[#09090b]">
			<div className="absolute inset-0 bg-[radial-gradient(circle_at_20%_20%,rgba(34,197,94,0.18),transparent_28%),radial-gradient(circle_at_80%_30%,rgba(56,189,248,0.18),transparent_26%),radial-gradient(circle_at_50%_80%,rgba(251,191,36,0.14),transparent_24%)]" />
			<div className="absolute inset-0 opacity-40 [background-image:linear-gradient(rgba(255,255,255,0.04)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.04)_1px,transparent_1px)] [background-size:60px_60px]" />
		</div>
	);
}

function NightModeOverlay() {
	const nightMode = useFeatureStore((s) => s.nightMode);
	if (!nightMode) return null;
	return (
		<div
			className="pointer-events-none fixed inset-0 z-[5]"
			style={{
				background:
					"radial-gradient(ellipse_at_center,rgba(15,15,40,0.7) 0%,rgba(5,5,20,0.85) 100%)",
			}}
		>
			<svg
				className="absolute inset-0 h-full w-full opacity-80"
				xmlns="http://www.w3.org/2000/svg"
			>
				{[...Array(80)].map((_, i) => {
					const x = (i * 137.508) % 100;
					const y = (i * 73.395) % 100;
					const r = 0.3 + (i % 5) * 0.2;
					const opacity = 0.3 + (i % 7) * 0.1;
					return (
						<circle
							key={i}
							cx={`${x}%`}
							cy={`${y}%`}
							r={r}
							fill="white"
							opacity={opacity}
						/>
					);
				})}
			</svg>
		</div>
	);
}

function TerminalOverlay() {
	const showTerminal = useEnvStore((s) => s.showTerminal);
	const setShowTerminal = useEnvStore((s) => s.setShowTerminal);
	return (
		<>
			{showTerminal && (
				<CommandTerminal
					isOpen={showTerminal}
					onClose={() => setShowTerminal(false)}
					onToggle={() => setShowTerminal(!showTerminal)}
				/>
			)}
		</>
	);
}

function DashboardPage() {
	const [showUserProfile, setShowUserProfile] = useState(false);
	const { user, isSignedIn, isLoaded } = useUser();
	const navigate = useNavigate();
	const mode = useFeatureStore((s) => s.mode);
	const {
		userLocation,
		setUserLocation,
		greenDestination,
		setGreenDestination,
		activeSearchPlace,
		setNavigationRoutes,
		setShowNavigationPanel,
		focusMode,
		setFocusMode,
		setMapFocus,
		selectedRouteId,
		setSelectedRouteId,
	} = useEnvStore();
	const routeSegments = useMemo<RouteSegment[]>(() => [], []);

	const handleRouteSelect = (routeId: string) => {
		setSelectedRouteId(routeId);
	};

	const handleClearRoute = () => {
		setNavigationRoutes({});
		setSelectedRouteId(null);
		setGreenDestination(null);
	};

	const computeRoutes = useCallback(async () => {
		if (!userLocation) return;
		if (greenDestination) {
			try {
				const impactData = generateLocalImpactDataProxy(
					userLocation[1],
					userLocation[0],
				);
				const routes = await calculateAlternativeRoutes(
					{ longitude: userLocation[0], latitude: userLocation[1] },
					{
						longitude: greenDestination.coordinates[0],
						latitude: greenDestination.coordinates[1],
					},
					impactData,
				);

				const fastest = routes.find((r) => r.id === "fastest");
				const cleanest = routes.find((r) => r.id === "cleanest");

				setNavigationRoutes({
					fastest: fastest
						? {
								coordinates: fastest.coordinates,
								duration: fastest.duration,
								distance: fastest.distance,
								aqi: fastest.aqi,
							}
						: undefined,
					cleanest: cleanest
						? {
								coordinates: cleanest.coordinates,
								duration: cleanest.duration,
								distance: cleanest.distance,
								aqi: cleanest.aqi,
							}
						: undefined,
				});
				setShowNavigationPanel(true);
			} catch {
				// Routes unavailable
			}
		}
	}, [
		userLocation,
		greenDestination,
		setNavigationRoutes,
		setShowNavigationPanel,
	]);

	useEffect(() => {
		void computeRoutes();
	}, [computeRoutes]);

	useEffect(() => {
		if (!greenDestination && !activeSearchPlace) {
			setNavigationRoutes({});
			setSelectedRouteId(null);
		}
	}, [
		greenDestination,
		activeSearchPlace,
		setNavigationRoutes,
		setSelectedRouteId,
	]);

	useEffect(() => {
		if (isLoaded && !isSignedIn) {
			navigate({ to: "/" });
		}
	}, [isLoaded, isSignedIn, navigate]);

	useEffect(() => {
		if (navigator.geolocation && !userLocation) {
			navigator.geolocation.getCurrentPosition(
				(position) => {
					setUserLocation([
						position.coords.longitude,
						position.coords.latitude,
					]);
				},
				() => {
					setUserLocation([-122.4, 37.74]);
				},
				{
					enableHighAccuracy: false,
					timeout: 10000,
					maximumAge: 5 * 60 * 1000,
				},
			);
		} else if (!navigator.geolocation && !userLocation) {
			setUserLocation([-122.4, 37.74]);
		}
	}, [userLocation, setUserLocation]);

	if (!isLoaded || !isSignedIn) {
		return (
			<div className="flex h-screen items-center justify-center bg-[#09090b]">
				<div className="h-6 w-6 animate-spin rounded-full border-2 border-emerald-500 border-t-transparent" />
			</div>
		);
	}

	return (
		<div className="relative h-screen w-full overflow-hidden bg-[#09090b] text-white">
			<div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_top_left,rgba(16,185,129,0.16),transparent_30%),radial-gradient(circle_at_top_right,rgba(56,189,248,0.12),transparent_26%)]" />

			<NightModeOverlay />

			<div className="absolute left-0 right-0 top-0 z-20 flex items-center justify-between px-4 py-4 sm:px-6">
				<div className="flex items-center gap-3 rounded-2xl border border-white/5 bg-black/55 px-4 py-3 backdrop-blur-md">
					<div className="h-2 w-2 rounded-full bg-emerald-400 animate-pulse" />
					<span className="font-display text-sm font-bold tracking-tight text-white">
						AirSentinel
					</span>
					<span className="text-[9px] uppercase tracking-[0.2em] text-zinc-500">
						OS
					</span>
					<button
						type="button"
						onClick={() => setMapFocus("user")}
						className="rounded-lg px-2 py-1 text-[10px] font-semibold text-emerald-400 transition-colors bg-emerald-500/10 hover:bg-emerald-500/20"
						title="Center on my location"
					>
						My Location
					</button>
					<button
						type="button"
						onClick={() => setFocusMode(!focusMode)}
						className={`ml-1 rounded-lg px-2 py-1 text-[10px] font-semibold transition-colors ${
							focusMode
								? "bg-emerald-500/30 text-emerald-300"
								: "bg-white/5 text-zinc-500 hover:bg-white/10"
						}`}
						title={focusMode ? "Exit focus mode" : "Focus mode — hide panels"}
					>
						{focusMode ? "FOCUS ON" : "FOCUS"}
					</button>
				</div>

				<TopWidgetBar />

				<div className="flex items-center gap-3">
					<ModeSwitcher />
					<div className="flex items-center gap-2 rounded-2xl border border-white/5 bg-black/40 px-3 py-2 backdrop-blur-md">
						<span className="hidden text-xs text-zinc-400 sm:block">
							Welcome, {user?.firstName ?? "Agent"}
						</span>
						<UserButton appearance={{ elements: { avatarBox: "h-8 w-8" } }} />
					</div>
				</div>
			</div>

			<Suspense fallback={<MapSkeleton />}>
				<div className="absolute inset-0 z-0">
					<CityMap routeSegments={routeSegments} userLocation={userLocation} />
				</div>
			</Suspense>

			<Suspense fallback={<OverlaySkeleton />}>
				<div className="absolute inset-0 z-10 pointer-events-none">
					<CompareView />
					{!focusMode && (
						<>
							<SmartAlerts />
							<PolicySimulator />
							<ChronosScrubber />
							{mode === "citizen" && <CitizenView />}
							{mode === "government" && (
								<>
									<GovView />
									<ThreatAttribution />
								</>
							)}
							<HexagonDetailPanel />
							<BreatheSafeNavigation
								routes={[]}
								onSelectRoute={handleRouteSelect}
								selectedRouteId={selectedRouteId ?? undefined}
								onClearRoute={handleClearRoute}
							/>
							<TerminalOverlay />
							<AudioToggle />
							<RoutePlanner />
						</>
					)}
					{focusMode && (
						<>
							<HexagonDetailPanel />
							<BreatheSafeNavigation
								routes={[]}
								onSelectRoute={handleRouteSelect}
								selectedRouteId={selectedRouteId ?? undefined}
								onClearRoute={handleClearRoute}
							/>
						</>
					)}
				</div>
			</Suspense>

			<Suspense fallback={null}>
				<GlobalRankModal />
				<AirPassportModal />
				<CityAirDuelModal />
				<LungSimulatorModal />
				<BodyXRayModal />
				<HospitalNetworkModal />
				<TimeMachineModal />
				<RadarModal />
				<GhostCitiesModal />
				<PollutionDNAModal />
				<AqiMarketModal />
				<CarbonTrackerModal />
				<CitizenReportModal />
				<CommunityLeaderboardModal />
				<PollutionNewsModal />
				<AqiMusicModal />
				<AIOracleModal />
				<ChemLabModal />
				<SatelliteDecodeModal />
				<AIAssistantModal />
				<CityBuilderModal />
				<AQIQuestModal />
			</Suspense>
		</div>
	);
}

interface ImpactDataPoint {
	position: [number, number];
	score: number;
}

function generateLocalImpactDataProxy(
	centerLat: number,
	centerLng: number,
): ImpactDataPoint[] {
	const points: ImpactDataPoint[] = [];
	for (let i = 0; i < 200; i++) {
		const angle = Math.random() * Math.PI * 2;
		const radius = Math.random() * 0.06;
		const lat = centerLat + Math.cos(angle) * radius;
		const lng = centerLng + Math.sin(angle) * radius * 1.3;
		const dist = Math.sqrt((lat - centerLat) ** 2 + (lng - centerLng) ** 2);
		const score = Math.max(
			5,
			Math.min(98, Math.round(30 + Math.random() * 60 - dist * 800)),
		);
		points.push({ position: [lng, lat], score });
	}
	return points;
}
