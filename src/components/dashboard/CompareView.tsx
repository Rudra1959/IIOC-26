import { AnimatePresence, motion } from "framer-motion";
import { ChevronDown, ChevronUp, X } from "lucide-react";
import { useState } from "react";
import { useEnvStore } from "#/store/envStore";

export function CompareView() {
	const [isExpanded, setIsExpanded] = useState(true);
	const comparePlaces = useEnvStore((s) => s.comparePlaces);
	const userLocation = useEnvStore((s) => s.userLocation);
	const removeComparePlace = useEnvStore((s) => s.removeComparePlace);
	const clearComparePlaces = useEnvStore((s) => s.clearComparePlaces);

	if (comparePlaces.length === 0) return null;

	function getAqi(place: (typeof comparePlaces)[0]): number {
		const seed =
			place.longitude * 1000 + place.latitude * 100 + place.id.length;
		return 30 + (Math.abs(seed) % 120);
	}

	const placesWithAqi = comparePlaces.map((p) => ({ ...p, aqi: getAqi(p) }));
	const maxAqi = Math.max(...placesWithAqi.map((p) => p.aqi));

	function getDistance(place: (typeof comparePlaces)[0]) {
		if (!userLocation) return null;
		const dx = place.longitude - userLocation[0];
		const dy = place.latitude - userLocation[1];
		return Math.sqrt(dx * dx + dy * dy) * 111;
	}

	function aqiColor(aqi: number) {
		if (aqi > 100) return { text: "#fca5a5", bar: "#dc2626" };
		if (aqi > 70) return { text: "#fdba74", bar: "#f97316" };
		if (aqi > 50) return { text: "#fde047", bar: "#eab308" };
		return { text: "#86efac", bar: "#22c55e" };
	}

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
						Comparing Locations
					</span>
					<div className="ml-auto flex items-center gap-1">
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
								{placesWithAqi.map((place) => {
									const colors = aqiColor(place.aqi);
									const dist = getDistance(place);
									const barPct = Math.round((place.aqi / maxAqi) * 100);

									return (
										<div
											key={place.id}
											className="relative flex min-w-[120px] flex-col gap-1.5 rounded-xl border border-white/5 bg-white/[0.03] p-2.5"
										>
											<button
												type="button"
												onClick={() => removeComparePlace(place.id)}
												className="absolute right-1.5 top-1.5 flex h-4 w-4 items-center justify-center rounded text-zinc-600 transition-colors hover:bg-red-500/20 hover:text-red-400"
											>
												<X className="h-2.5 w-2.5" />
											</button>

											<p className="pr-3 font-mono text-[10px] font-bold text-white truncate">
												{place.label}
											</p>

											<div className="flex items-center justify-between">
												<span
													className="font-mono text-[11px] font-black"
													style={{ color: colors.text }}
												>
													{place.aqi}
												</span>
												{place.country && (
													<span className="font-mono text-[8px] text-zinc-600">
														{place.country}
													</span>
												)}
											</div>

											<div className="h-1 w-full overflow-hidden rounded-full bg-white/5">
												<div
													className="h-full rounded-full transition-all duration-500"
													style={{
														width: `${barPct}%`,
														backgroundColor: colors.bar,
													}}
												/>
											</div>

											{dist !== null && (
												<span className="font-mono text-[8px] text-zinc-600">
													{dist < 1
														? `${Math.round(dist * 1000)}m`
														: `${dist.toFixed(1)}km`}{" "}
													away
												</span>
											)}
										</div>
									);
								})}
							</div>
						</motion.div>
					)}
				</AnimatePresence>
			</div>
		</motion.div>
	);
}
