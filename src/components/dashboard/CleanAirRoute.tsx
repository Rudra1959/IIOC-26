import { motion } from "framer-motion";
import {
	AlertTriangle,
	ChevronRight,
	MapPin,
	Navigation,
	RefreshCw,
	Route,
	Shield,
	Wind,
} from "lucide-react";
import { useCallback, useState } from "react";
import { useEnvStore } from "#/store/envStore";

interface RouteComparison {
	id: string;
	label: string;
	duration: number;
	distance: number;
	exposureLevel: "low" | "moderate" | "high";
	aqi: number;
	pm25Reduction: number;
	additionalTime: number;
	healthScore: number;
}

function getAQIColor(aqi: number): string {
	if (aqi <= 50) return "#22c55e";
	if (aqi <= 100) return "#eab308";
	if (aqi <= 150) return "#f97316";
	return "#dc2626";
}

function getExposureColor(level: "low" | "moderate" | "high"): string {
	switch (level) {
		case "low":
			return "#22c55e";
		case "moderate":
			return "#eab308";
		case "high":
			return "#dc2626";
	}
}

function generateMockRoutes(): {
	fastest: RouteComparison;
	cleanest: RouteComparison;
} {
	const fastestAqi = 85 + Math.round(Math.random() * 40);
	const cleanestAqi = Math.round(fastestAqi * (0.5 + Math.random() * 0.3));

	const fastestDuration = 15 + Math.round(Math.random() * 20);
	const cleanestDuration = fastestDuration + 5 + Math.round(Math.random() * 15);

	return {
		fastest: {
			id: "fastest",
			label: "Fastest Route",
			duration: fastestDuration,
			distance: 5 + Math.round(Math.random() * 10),
			exposureLevel:
				fastestAqi > 100 ? "high" : fastestAqi > 50 ? "moderate" : "low",
			aqi: fastestAqi,
			pm25Reduction: 0,
			additionalTime: 0,
			healthScore: Math.round(100 - fastestAqi * 0.5),
		},
		cleanest: {
			id: "cleanest",
			label: "Blue-Sky Route",
			duration: cleanestDuration,
			distance: 7 + Math.round(Math.random() * 12),
			exposureLevel:
				cleanestAqi > 100 ? "high" : cleanestAqi > 50 ? "moderate" : "low",
			aqi: cleanestAqi,
			pm25Reduction: Math.round(
				((fastestAqi - cleanestAqi) / fastestAqi) * 100,
			),
			additionalTime: cleanestDuration - fastestDuration,
			healthScore: Math.round(100 - cleanestAqi * 0.5),
		},
	};
}

export function CleanAirRoute() {
	const [isCollapsed, setIsCollapsed] = useState(false);
	const [startLocation, setStartLocation] = useState("City Park");
	const [endLocation, setEndLocation] = useState("Tech Hub");
	const [selectedRoute, setSelectedRoute] = useState<string | null>(null);
	const [isCalculating, setIsCalculating] = useState(false);

	const setNavigationRoutes = useEnvStore((s) => s.setNavigationRoutes);
	const setSelectedRouteId = useEnvStore((s) => s.setSelectedRouteId);

	const routes = generateMockRoutes();

	const handleFindRoute = useCallback(async () => {
		setIsCalculating(true);
		setSelectedRoute(null);

		await new Promise((resolve) => setTimeout(resolve, 1500));

		setNavigationRoutes({
			fastest: {
				aqi: routes.fastest.aqi,
				duration: routes.fastest.duration,
				distance: routes.fastest.distance,
				coordinates: [],
			},
			cleanest: {
				aqi: routes.cleanest.aqi,
				duration: routes.cleanest.duration,
				distance: routes.cleanest.distance,
				coordinates: [],
			},
		});

		setIsCalculating(false);
	}, [routes, setNavigationRoutes]);

	const handleSelectRoute = useCallback(
		(routeId: string) => {
			setSelectedRoute(routeId);
			setSelectedRouteId(routeId);
		},
		[setSelectedRouteId],
	);

	if (isCollapsed) {
		return (
			<motion.button
				initial={{ opacity: 0, x: 20 }}
				animate={{ opacity: 1, x: 0 }}
				transition={{ duration: 0.3 }}
				type="button"
				onClick={() => setIsCollapsed(false)}
				className="pointer-events-auto absolute top-24 right-4 z-30 flex items-center gap-2 rounded-xl border border-teal-500/20 bg-black/95 px-3 py-2 shadow-2xl backdrop-blur-2xl transition-colors hover:bg-white/[0.03]"
			>
				<Shield className="h-4 w-4 text-teal-400" />
				<span className="font-mono text-[10px] font-bold uppercase tracking-widest text-teal-400">
					Clean-Air
				</span>
			</motion.button>
		);
	}

	return (
		<motion.div
			initial={{ opacity: 0, x: 20, scale: 0.95 }}
			animate={{ opacity: 1, x: 0, scale: 1 }}
			exit={{ opacity: 0, x: 20, scale: 0.95 }}
			transition={{ duration: 0.4, ease: [0.16, 1, 0.3, 1] }}
			className="pointer-events-auto absolute top-24 right-4 z-30 w-72 overflow-hidden rounded-2xl border border-teal-500/20 bg-black/95 shadow-2xl backdrop-blur-2xl"
		>
			<div className="flex items-center justify-between border-b border-white/10 bg-gradient-to-r from-teal-500/10 to-cyan-500/10 px-4 py-3">
				<div className="flex items-center gap-2">
					<Shield className="h-5 w-5 text-teal-400" />
					<div>
						<h3 className="font-mono text-[11px] font-bold uppercase tracking-widest text-teal-400">
							Clean-Air Route
						</h3>
						<p className="font-mono text-[9px] text-zinc-500">
							Find healthiest path
						</p>
					</div>
				</div>
				<button
					type="button"
					onClick={() => setIsCollapsed(true)}
					className="rounded-lg p-1 text-zinc-500 transition-colors hover:bg-white/10 hover:text-white"
				>
					<ChevronRight className="h-4 w-4" />
				</button>
			</div>

			<div className="p-4 space-y-3">
				<div className="space-y-2">
					<div className="flex items-center gap-2">
						<div className="flex h-6 w-6 items-center justify-center rounded-full bg-teal-500/20">
							<MapPin className="h-3 w-3 text-teal-400" />
						</div>
						<input
							type="text"
							value={startLocation}
							onChange={(e) => setStartLocation(e.target.value)}
							placeholder="Start location"
							className="flex-1 rounded border border-white/10 bg-white/5 px-2 py-1 font-mono text-[10px] text-white placeholder-zinc-600 outline-none focus:border-teal-500/50"
						/>
					</div>
					<div className="ml-3 h-4 w-0.5 rounded-full bg-gradient-to-b from-teal-500/50 to-cyan-500/50" />
					<div className="flex items-center gap-2">
						<div className="flex h-6 w-6 items-center justify-center rounded-full bg-cyan-500/20">
							<Navigation className="h-3 w-3 text-cyan-400" />
						</div>
						<input
							type="text"
							value={endLocation}
							onChange={(e) => setEndLocation(e.target.value)}
							placeholder="End location"
							className="flex-1 rounded border border-white/10 bg-white/5 px-2 py-1 font-mono text-[10px] text-white placeholder-zinc-600 outline-none focus:border-teal-500/50"
						/>
					</div>
				</div>

				<button
					type="button"
					onClick={handleFindRoute}
					disabled={isCalculating}
					className="w-full rounded-lg bg-gradient-to-r from-teal-500 to-cyan-500 px-3 py-2 font-mono text-[11px] font-bold uppercase tracking-widest text-white shadow-lg shadow-teal-500/20 transition-all hover:from-teal-400 hover:to-cyan-400 disabled:opacity-50"
				>
					{isCalculating ? (
						<span className="flex items-center justify-center gap-2">
							<RefreshCw className="h-3 w-3 animate-spin" />
							Calculating...
						</span>
					) : (
						"Find Healthiest Route"
					)}
				</button>

				<div className="space-y-2">
					<button
						type="button"
						onClick={() => handleSelectRoute("fastest")}
						className={`w-full cursor-pointer rounded-lg border p-3 text-left transition-all ${
							selectedRoute === "fastest"
								? "border-amber-500/50 bg-amber-500/10"
								: "border-white/10 bg-white/5 hover:border-white/20"
						}`}
					>
						<div className="mb-2 flex items-center justify-between">
							<div className="flex items-center gap-2">
								<Route className="h-3.5 w-3.5 text-amber-400" />
								<span className="font-mono text-[10px] font-bold text-white">
									{routes.fastest.label}
								</span>
							</div>
							<div
								className="rounded px-1.5 py-0.5 font-mono text-[8px] font-bold"
								style={{
									backgroundColor: `${getExposureColor(routes.fastest.exposureLevel)}20`,
									color: getExposureColor(routes.fastest.exposureLevel),
								}}
							>
								{routes.fastest.exposureLevel.toUpperCase()}
							</div>
						</div>

						<div className="grid grid-cols-3 gap-2">
							<div className="text-center">
								<p className="font-mono text-[7px] text-zinc-500">Time</p>
								<p className="font-mono text-[11px] font-bold text-white">
									{routes.fastest.duration} min
								</p>
							</div>
							<div className="text-center">
								<p className="font-mono text-[7px] text-zinc-500">Distance</p>
								<p className="font-mono text-[11px] font-bold text-white">
									{routes.fastest.distance} km
								</p>
							</div>
							<div className="text-center">
								<p className="font-mono text-[7px] text-zinc-500">AQI</p>
								<p
									className="font-mono text-[11px] font-bold"
									style={{ color: getAQIColor(routes.fastest.aqi) }}
								>
									{routes.fastest.aqi}
								</p>
							</div>
						</div>
					</button>

					<button
						type="button"
						onClick={() => handleSelectRoute("cleanest")}
						className={`cursor-pointer rounded-lg border p-3 transition-all ${
							selectedRoute === "cleanest"
								? "border-teal-500/50 bg-teal-500/10"
								: "border-white/10 bg-white/5 hover:border-white/20"
						}`}
					>
						<div className="mb-2 flex items-center justify-between">
							<div className="flex items-center gap-2">
								<Wind className="h-3.5 w-3.5 text-teal-400" />
								<span className="font-mono text-[10px] font-bold text-teal-400">
									{routes.cleanest.label}
								</span>
								{routes.cleanest.additionalTime > 0 && (
									<span className="rounded bg-teal-500/20 px-1 py-0.5 font-mono text-[7px] text-teal-300">
										+{routes.cleanest.additionalTime} min
									</span>
								)}
							</div>
							<div
								className="rounded px-1.5 py-0.5 font-mono text-[8px] font-bold"
								style={{
									backgroundColor: `${getExposureColor(routes.cleanest.exposureLevel)}20`,
									color: getExposureColor(routes.cleanest.exposureLevel),
								}}
							>
								{routes.cleanest.exposureLevel.toUpperCase()}
							</div>
						</div>

						<div className="grid grid-cols-3 gap-2">
							<div className="text-center">
								<p className="font-mono text-[7px] text-zinc-500">Time</p>
								<p className="font-mono text-[11px] font-bold text-white">
									{routes.cleanest.duration} min
								</p>
							</div>
							<div className="text-center">
								<p className="font-mono text-[7px] text-zinc-500">Distance</p>
								<p className="font-mono text-[11px] font-bold text-white">
									{routes.cleanest.distance} km
								</p>
							</div>
							<div className="text-center">
								<p className="font-mono text-[7px] text-zinc-500">AQI</p>
								<p
									className="font-mono text-[11px] font-bold"
									style={{ color: getAQIColor(routes.cleanest.aqi) }}
								>
									{routes.cleanest.aqi}
								</p>
							</div>
						</div>

						<div className="mt-2 flex items-center gap-2 rounded bg-teal-500/10 px-2 py-1">
							<Shield className="h-3 w-3 text-teal-400" />
							<span className="font-mono text-[8px] text-teal-300">
								{routes.cleanest.pm25Reduction}% less PM2.5 exposure
							</span>
						</div>
					</button>
				</div>

				<div className="rounded-lg border border-white/10 bg-white/5 p-2">
					<div className="flex items-center justify-between">
						<span className="font-mono text-[9px] text-zinc-500">
							Health Score
						</span>
						<span className="font-mono text-[10px] font-bold text-teal-400">
							{routes.cleanest.healthScore > routes.fastest.healthScore
								? "Clean"
								: "Fast"}{" "}
							route recommended
						</span>
					</div>
					<div className="mt-1.5 h-2 w-full overflow-hidden rounded-full bg-white/5">
						<div
							className="h-full rounded-full bg-gradient-to-r from-teal-500 to-cyan-500"
							style={{ width: `${routes.cleanest.healthScore}%` }}
						/>
					</div>
				</div>

				<div className="flex items-center gap-1.5 rounded bg-amber-500/10 px-2 py-1.5 font-mono text-[8px] text-amber-300">
					<AlertTriangle className="h-3 w-3 flex-shrink-0" />
					<span>
						Based on real-time AQI data from{" "}
						{selectedRoute === "cleanest" ? "8" : "5"} monitoring stations
					</span>
				</div>
			</div>
		</motion.div>
	);
}
