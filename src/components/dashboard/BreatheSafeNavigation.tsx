import { AnimatePresence, motion } from "framer-motion";
import { ChevronDown, ChevronUp, Wind } from "lucide-react";
import { useState } from "react";
import { useEnvStore } from "#/store/envStore";

interface RouteOption {
	id: string;
	label: string;
	duration: number;
	distance: number;
	exposureLevel: "low" | "moderate" | "high";
	pm25Reduction: number;
	aqi: number;
}

interface BreatheSafeNavigationProps {
	from?: string;
	to?: string;
	routes: RouteOption[];
	onSelectRoute: (routeId: string) => void;
	selectedRouteId?: string;
	onClearRoute?: () => void;
}

function useLocalRoutes(): RouteOption[] {
	const navigationRoutes = useEnvStore((s) => s.navigationRoutes);

	if (!navigationRoutes.fastest && !navigationRoutes.cleanest) {
		return [];
	}

	const fastest: RouteOption | undefined = navigationRoutes.fastest
		? {
				id: "fastest",
				label: "Fastest",
				duration: navigationRoutes.fastest.duration,
				distance: navigationRoutes.fastest.distance,
				exposureLevel:
					navigationRoutes.fastest.aqi > 100
						? "high"
						: navigationRoutes.fastest.aqi > 50
							? "moderate"
							: "low",
				pm25Reduction: 0,
				aqi: navigationRoutes.fastest.aqi,
			}
		: undefined;

	const cleanest: RouteOption | undefined = navigationRoutes.cleanest
		? {
				id: "cleanest",
				label: "Blue-Sky",
				duration: navigationRoutes.cleanest.duration,
				distance: navigationRoutes.cleanest.distance,
				exposureLevel: "low",
				pm25Reduction: fastest
					? Math.max(
							0,
							Math.round(
								((fastest.aqi - navigationRoutes.cleanest.aqi) / fastest.aqi) *
									100,
							),
						)
					: 30,
				aqi: navigationRoutes.cleanest.aqi,
			}
		: undefined;

	return [fastest, cleanest].filter(Boolean) as RouteOption[];
}

function formatDuration(minutes: number): string {
	if (minutes < 60) return `${Math.round(minutes)}m`;
	const h = Math.floor(minutes / 60);
	const m = Math.round(minutes % 60);
	return m > 0 ? `${h}h${m}m` : `${h}h`;
}

function AqiBar({ value }: { value: number }) {
	const pct = Math.min(100, (value / 200) * 100);
	const color = value > 100 ? "#dc2626" : value > 50 ? "#eab308" : "#22c55e";
	return (
		<div className="h-1.5 w-16 overflow-hidden rounded-full bg-white/10">
			<div
				className="h-full rounded-full transition-all duration-500"
				style={{ width: `${pct}%`, backgroundColor: color }}
			/>
		</div>
	);
}

function MiniRoutePill({
	route,
	isBest,
	isSelected,
	onSelect,
}: {
	route: RouteOption;
	isBest: boolean;
	isSelected: boolean;
	onSelect: () => void;
}) {
	const color =
		route.exposureLevel === "low"
			? "#22c55e"
			: route.exposureLevel === "moderate"
				? "#eab308"
				: "#dc2626";

	return (
		<button
			type="button"
			onClick={onSelect}
			className={`flex items-center gap-2 rounded-full px-3 py-2 transition-all ${
				isSelected
					? "bg-white/10 ring-1 ring-white/20"
					: "bg-black/60 hover:bg-black/80"
			}`}
		>
			<div
				className="flex h-7 w-7 items-center justify-center rounded-full"
				style={{ backgroundColor: `${color}25` }}
			>
				<Wind className="h-3.5 w-3.5" style={{ color }} />
			</div>

			<div className="flex flex-col items-start">
				<div className="flex items-center gap-1.5">
					<span className="text-xs font-bold text-white">{route.label}</span>
					{isBest && (
						<span
							className="rounded px-1 py-0.5 text-[8px] font-bold"
							style={{ backgroundColor: `${color}25`, color }}
						>
							BEST
						</span>
					)}
				</div>
				<div className="flex items-center gap-1.5">
					<span className="text-[10px] font-black" style={{ color }}>
						{route.aqi}
					</span>
					<AqiBar value={route.aqi} />
					<span className="text-[9px] text-zinc-500">
						{formatDuration(route.duration)}
					</span>
				</div>
			</div>
		</button>
	);
}

export function BreatheSafeNavigation({
	routes: propsRoutes,
	onSelectRoute,
	selectedRouteId,
	onClearRoute,
}: BreatheSafeNavigationProps) {
	const [isCollapsed, setIsCollapsed] = useState(false);
	const localRoutes = useLocalRoutes();
	const routes = propsRoutes.length > 0 ? propsRoutes : localRoutes;

	if (routes.length === 0) return null;

	const fastestRoute = routes.reduce(
		(f, r) => (r.duration < f.duration ? r : f),
		routes[0],
	);
	const cleanestRoute = routes.reduce(
		(c, r) => (r.exposureLevel === "low" ? r : c),
		routes[0],
	);
	const bestRoute =
		cleanestRoute.aqi < fastestRoute.aqi ? cleanestRoute : fastestRoute;

	return (
		<AnimatePresence>
			<motion.div
				initial={{ opacity: 0, y: 60, scale: 0.95 }}
				animate={{ opacity: 1, y: 0, scale: 1 }}
				exit={{ opacity: 0, y: 60, scale: 0.95 }}
				transition={{ duration: 0.35, ease: [0.16, 1, 0.3, 1] }}
				className="pointer-events-auto absolute bottom-6 left-1/2 z-30 -translate-x-1/2"
			>
				<div
					className={`flex items-center gap-3 rounded-full border border-white/10 bg-black/80 px-3 py-2 shadow-2xl backdrop-blur-xl transition-all ${
						isCollapsed ? "w-auto" : "w-auto max-w-2xl"
					}`}
				>
					<div className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-emerald-500/20">
						<Wind className="h-3.5 w-3.5 text-emerald-400" />
					</div>

					<div className="flex items-center gap-2">
						{routes.map((route) => (
							<MiniRoutePill
								key={route.id}
								route={route}
								isBest={route.id === bestRoute.id}
								isSelected={selectedRouteId === route.id}
								onSelect={() => onSelectRoute(route.id)}
							/>
						))}
					</div>

					<div className="flex h-4 w-px bg-white/10" />

					<div className="flex items-center gap-1">
						<div className="flex items-center gap-0.5">
							<div className="h-1.5 w-4 rounded-full bg-[#22c55e]" />
							<div className="h-1.5 w-4 rounded-full bg-[#eab308]" />
							<div className="h-1.5 w-4 rounded-full bg-[#dc2626]" />
						</div>
						<span className="text-[9px] text-zinc-500">
							{routes.length} routes
						</span>
					</div>

					{onClearRoute && (
						<button
							type="button"
							onClick={onClearRoute}
							className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full text-zinc-400 transition-colors hover:bg-red-500/20 hover:text-red-400"
							title="Clear route"
						>
							<svg
								className="h-3.5 w-3.5"
								viewBox="0 0 24 24"
								fill="none"
								stroke="currentColor"
								strokeWidth="2"
								aria-hidden="true"
							>
								<path d="M18 6L6 18M6 6l12 12" />
							</svg>
						</button>
					)}

					<button
						type="button"
						onClick={() => setIsCollapsed(!isCollapsed)}
						className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full text-zinc-400 transition-colors hover:bg-white/10 hover:text-white"
						title={isCollapsed ? "Expand routes" : "Collapse routes"}
					>
						{isCollapsed ? (
							<ChevronUp className="h-3.5 w-3.5" />
						) : (
							<ChevronDown className="h-3.5 w-3.5" />
						)}
					</button>
				</div>
			</motion.div>
		</AnimatePresence>
	);
}
