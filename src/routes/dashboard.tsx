import { UserButton, useUser } from "@clerk/clerk-react";
import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { lazy, Suspense, useEffect, useMemo } from "react";
import type { RouteSegment } from "#/components/map/CityMap";
import { useEnvStore } from "#/store/envStore";

const CityMap = lazy(() =>
	import("#/components/map/CityMap").then((module) => ({
		default: module.CityMap,
	})),
);
const GovView = lazy(() =>
	import("#/components/dashboard/GovView").then((module) => ({
		default: module.GovView,
	})),
);
const CitizenView = lazy(() =>
	import("#/components/dashboard/CitizenView").then((module) => ({
		default: module.CitizenView,
	})),
);
const SmartAlerts = lazy(() =>
	import("#/components/dashboard/SmartAlerts").then((module) => ({
		default: module.SmartAlerts,
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

function DashboardPage() {
	const { user, isSignedIn, isLoaded } = useUser();
	const navigate = useNavigate();
	const { userLocation, setUserLocation } = useEnvStore();
	const routeSegments = useMemo<RouteSegment[]>(() => [], []);

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

			<div className="absolute left-0 right-0 top-0 z-20 flex items-center justify-between px-4 py-4 sm:px-6">
				<div className="flex items-center gap-3 rounded-2xl border border-white/5 bg-black/55 px-4 py-3 backdrop-blur-md">
					<div className="h-2 w-2 rounded-full bg-emerald-400 animate-pulse" />
					<span className="font-display text-sm font-bold tracking-tight text-white">
						AirSentinel
					</span>
					<span className="text-[9px] uppercase tracking-[0.2em] text-zinc-500">
						OS
					</span>
				</div>
				<div className="flex items-center gap-3 rounded-2xl border border-white/5 bg-black/40 px-3 py-2 backdrop-blur-md">
					<span className="hidden text-xs text-zinc-400 sm:block">
						Welcome, {user?.firstName ?? "Agent"}
					</span>
					<UserButton appearance={{ elements: { avatarBox: "h-8 w-8" } }} />
				</div>
			</div>

			<Suspense fallback={<MapSkeleton />}>
				<div className="absolute inset-0 z-0">
					<CityMap routeSegments={routeSegments} userLocation={userLocation} />
				</div>
			</Suspense>

			<Suspense fallback={<OverlaySkeleton />}>
				<div className="absolute inset-0 z-10 pointer-events-none">
					<SmartAlerts />
					<GovView />
					<CitizenView />
				</div>
			</Suspense>
		</div>
	);
}
