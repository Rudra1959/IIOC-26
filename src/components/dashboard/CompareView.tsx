import { useQuery as useTanstackQuery } from "@tanstack/react-query";
import { AnimatePresence, motion } from "framer-motion";
import { ChevronDown, ChevronUp, Loader2, RefreshCw, X } from "lucide-react";
import { useState } from "react";
import { getAqiMeta } from "#/lib/air-quality";
import { fetchPlaceAqi } from "#/lib/environment";
import { useEnvStore } from "#/store/envStore";

function aqiColor(aqi: number | null): {
	text: string;
	bar: string;
	bg: string;
} {
	if (aqi === null) return { text: "#6b7280", bar: "#6b7280", bg: "#6b728040" };
	if (aqi <= 50) return { text: "#22c55e", bar: "#22c55e", bg: "#22c55e40" };
	if (aqi <= 100) return { text: "#eab308", bar: "#eab308", bg: "#eab30840" };
	if (aqi <= 150) return { text: "#f97316", bar: "#f97316", bg: "#f9731640" };
	if (aqi <= 200) return { text: "#dc2626", bar: "#dc2626", bg: "#dc262640" };
	if (aqi <= 300) return { text: "#a21caf", bar: "#a21caf", bg: "#a21caf40" };
	return { text: "#7f1d1d", bar: "#7f1d1d", bg: "#7f1d1d40" };
}

function getDistance(
	longitude: number,
	latitude: number,
	userLocation: [number, number] | null,
): string | null {
	if (!userLocation) return null;
	const dx = longitude - userLocation[0];
	const dy = latitude - userLocation[1];
	const dist = Math.sqrt(dx * dx + dy * dy) * 111;
	return dist < 1 ? `${Math.round(dist * 1000)}m` : `${dist.toFixed(1)}km`;
}

function ComparePlaceCard({
	place,
}: {
	place: {
		id: string;
		label: string;
		latitude: number;
		longitude: number;
		country?: string;
	};
}) {
	const userLocation = useEnvStore((s) => s.userLocation);
	const removeComparePlace = useEnvStore((s) => s.removeComparePlace);

	const query = useTanstackQuery({
		queryKey: ["compareAqi", place.latitude, place.longitude],
		enabled: true,
		staleTime: 60 * 1000,
		gcTime: 5 * 60 * 1000,
		refetchInterval: 60 * 1000,
		queryFn: () => fetchPlaceAqi(place.latitude, place.longitude),
	});

	const colors = aqiColor(query.data?.aqi ?? null);
	const band = query.data?.band ?? "moderate";
	const meta = query.data?.aqi != null ? getAqiMeta(query.data.aqi) : null;
	const dist = getDistance(place.longitude, place.latitude, userLocation);
	const barPct =
		query.data?.aqi != null ? Math.min(100, (query.data.aqi / 300) * 100) : 0;

	return (
		<motion.div
			layout
			initial={{ opacity: 0, scale: 0.9 }}
			animate={{ opacity: 1, scale: 1 }}
			exit={{ opacity: 0, scale: 0.9 }}
			transition={{ duration: 0.2 }}
			className="relative flex min-w-[130px] flex-col gap-2 rounded-xl border p-3 transition-all"
			style={{
				borderColor: `${colors.bar}30`,
				background: `${colors.bg}`,
			}}
		>
			<button
				type="button"
				onClick={() => removeComparePlace(place.id)}
				className="absolute right-1.5 top-1.5 flex h-5 w-5 items-center justify-center rounded text-zinc-500 transition-colors hover:bg-red-500/20 hover:text-red-400"
				title="Remove from comparison"
			>
				<X className="h-3 w-3" />
			</button>

			<p className="pr-4 font-mono text-[10px] font-bold text-white truncate">
				{place.label}
			</p>

			{query.isFetching && (
				<div className="flex items-center justify-center py-2">
					<Loader2 className="h-4 w-4 animate-spin text-zinc-500" />
				</div>
			)}

			{!query.isFetching && (
				<>
					<div className="flex items-end justify-between">
						<span
							className="font-mono text-2xl font-black leading-none"
							style={{ color: colors.text }}
						>
							{query.data?.aqi != null ? Math.round(query.data.aqi) : "--"}
						</span>
						<div className="flex flex-col items-end">
							<span
								className="font-mono text-[7px] font-bold uppercase"
								style={{ color: colors.text }}
							>
								{meta?.label ?? "Unknown"}
							</span>
							<span className="font-mono text-[7px] text-zinc-600">{band}</span>
						</div>
					</div>

					<div className="h-1 w-full overflow-hidden rounded-full bg-white/5">
						<motion.div
							initial={{ width: 0 }}
							animate={{ width: `${barPct}%` }}
							transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
							className="h-full rounded-full"
							style={{ backgroundColor: colors.bar }}
						/>
					</div>

					{dist && (
						<span className="font-mono text-[7px] text-zinc-500">
							{dist} away
						</span>
					)}

					<div className="flex items-center gap-1">
						<button
							type="button"
							onClick={() => void query.refetch()}
							className="flex items-center gap-0.5 rounded px-1 py-0.5 font-mono text-[7px] text-zinc-600 transition-colors hover:text-white"
							title="Refresh"
						>
							<RefreshCw className="h-2.5 w-2.5" />
							60s
						</button>
						<span
							className="h-1 w-1 rounded-full"
							style={{
								backgroundColor: query.isStale ? "#eab308" : "#22c55e",
								boxShadow: `0 0 4px ${query.isStale ? "#eab308" : "#22c55e"}`,
							}}
						/>
					</div>
				</>
			)}
		</motion.div>
	);
}

export function CompareView() {
	const [isExpanded, setIsExpanded] = useState(true);
	const comparePlaces = useEnvStore((s) => s.comparePlaces);
	const clearComparePlaces = useEnvStore((s) => s.clearComparePlaces);

	if (comparePlaces.length === 0) return null;

	return (
		<motion.div
			initial={{ opacity: 0, y: -20, scale: 0.95 }}
			animate={{ opacity: 1, y: 0, scale: 1 }}
			exit={{ opacity: 0, y: -20, scale: 0.95 }}
			transition={{ duration: 0.35, ease: [0.16, 1, 0.3, 1] }}
			className="pointer-events-auto absolute left-1/2 top-20 z-30 -translate-x-1/2"
		>
			<div className="rounded-2xl border border-yellow-500/20 bg-black/90 shadow-2xl backdrop-blur-2xl">
				<div className="flex items-center gap-2 border-b border-white/5 px-3 py-2">
					<div className="flex h-5 w-5 items-center justify-center rounded-full bg-yellow-500/20">
						<span className="font-mono text-[10px] font-bold text-yellow-400">
							{comparePlaces.length}
						</span>
					</div>
					<span className="font-mono text-[10px] font-bold uppercase tracking-widest text-yellow-400">
						Real-Time Compare
					</span>
					<div className="ml-auto flex items-center gap-1">
						<span className="h-1.5 w-1.5 rounded-full bg-yellow-400 animate-pulse shadow-lg shadow-yellow-400/50" />
						<span className="font-mono text-[7px] text-zinc-600">LIVE</span>
						<button
							type="button"
							onClick={clearComparePlaces}
							className="rounded px-1.5 py-0.5 font-mono text-[9px] text-zinc-500 transition-colors hover:bg-red-500/20 hover:text-red-400"
						>
							Clear All
						</button>
						<button
							type="button"
							onClick={() => setIsExpanded(!isExpanded)}
							className="flex h-5 w-5 items-center justify-center rounded text-zinc-500 transition-colors hover:bg-white/10 hover:text-white"
						>
							{isExpanded ? (
								<ChevronUp className="h-3 w-3" />
							) : (
								<ChevronDown className="h-3 w-3" />
							)}
						</button>
					</div>
				</div>

				<AnimatePresence>
					{isExpanded && (
						<motion.div
							initial={{ height: 0, opacity: 0 }}
							animate={{ height: "auto", opacity: 1 }}
							exit={{ height: 0, opacity: 0 }}
							transition={{ duration: 0.25, ease: "easeOut" }}
							className="overflow-hidden"
						>
							<div className="flex gap-2 p-3">
								{comparePlaces.map((place) => (
									<ComparePlaceCard
										key={place.id}
										place={{
											id: place.id,
											label: place.label,
											latitude: place.latitude,
											longitude: place.longitude,
											country: place.country,
										}}
									/>
								))}
							</div>
						</motion.div>
					)}
				</AnimatePresence>
			</div>
		</motion.div>
	);
}
