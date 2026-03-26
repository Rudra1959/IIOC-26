import { AnimatePresence, motion } from "framer-motion";
import { Activity, MapPin, MessageCircleQuestion, Wind } from "lucide-react";
import { useState } from "react";
import { useEnvStore } from "#/store/envStore";

export function OnboardingCard() {
	const [isExpanded, setIsExpanded] = useState(false);
	const setMapFocus = useEnvStore((s) => s.setMapFocus);
	const setHighlightedMetric = useEnvStore((s) => s.setHighlightedMetric);
	const setShowWind = useEnvStore((s) => s.setShowWind);
	const setShowTerminal = useEnvStore((s) => s.setShowTerminal);

	const handleViewAQI = () => {
		setMapFocus("user");
		setIsExpanded(false);
	};

	const handleHealthRisk = () => {
		setShowTerminal(true);
		setIsExpanded(false);
	};

	const handleExplorePollution = () => {
		setHighlightedMetric("pm25");
		setShowWind(true);
		setIsExpanded(false);
	};

	const options = [
		{
			id: "aqi",
			label: "View AQI near me",
			icon: MapPin,
			color: "#22c55e",
			action: handleViewAQI,
		},
		{
			id: "health",
			label: "Check health risk",
			icon: Activity,
			color: "#ef4444",
			action: handleHealthRisk,
		},
		{
			id: "explore",
			label: "Explore pollution",
			icon: Wind,
			color: "#3b82f6",
			action: handleExplorePollution,
		},
	];

	return (
		<div className="relative">
			<AnimatePresence mode="wait">
				{isExpanded ? (
					<motion.div
						key="expanded"
						initial={{ opacity: 0, y: 10, scale: 0.95 }}
						animate={{ opacity: 1, y: 0, scale: 1 }}
						exit={{ opacity: 0, y: 10, scale: 0.95 }}
						transition={{ duration: 0.2, ease: [0.16, 1, 0.3, 1] }}
						className="absolute top-full left-1/2 -translate-x-1/2 mt-2 w-[280px] rounded-xl border border-white/10 bg-black/95 shadow-2xl backdrop-blur-xl z-50"
					>
						<div className="flex items-center justify-between border-b border-white/10 bg-gradient-to-r from-emerald-500/10 to-transparent px-4 py-3">
							<div className="flex items-center gap-2">
								<MessageCircleQuestion className="h-4 w-4 text-emerald-400" />
								<span className="font-mono text-[10px] font-bold uppercase tracking-widest text-emerald-400">
									What do you want to do?
								</span>
							</div>
							<button
								type="button"
								onClick={() => setIsExpanded(false)}
								className="rounded-lg p-1 text-zinc-500 transition-colors hover:bg-white/10 hover:text-white"
							>
								<svg
									className="h-4 w-4"
									fill="none"
									viewBox="0 0 24 24"
									stroke="currentColor"
								>
									<path
										strokeLinecap="round"
										strokeLinejoin="round"
										strokeWidth={2}
										d="M6 18L18 6M6 6l12 12"
									/>
								</svg>
							</button>
						</div>
						<div className="p-3">
							<div className="flex flex-col gap-2">
								{options.map((option) => (
									<motion.button
										key={option.id}
										type="button"
										onClick={option.action}
										className="flex items-center gap-3 rounded-lg border border-white/5 bg-white/5 px-4 py-3 transition-all hover:border-white/20 hover:bg-white/10"
										whileHover={{ scale: 1.01 }}
										whileTap={{ scale: 0.98 }}
									>
										<div
											className="flex h-8 w-8 items-center justify-center rounded-lg"
											style={{ backgroundColor: `${option.color}20` }}
										>
											<option.icon
												className="h-4 w-4"
												style={{ color: option.color }}
											/>
										</div>
										<span className="font-mono text-[11px] text-white">
											{option.label}
										</span>
									</motion.button>
								))}
							</div>
						</div>
					</motion.div>
				) : (
					<motion.button
						key="collapsed"
						initial={{ opacity: 0 }}
						animate={{ opacity: 1 }}
						exit={{ opacity: 0 }}
						transition={{ duration: 0.15 }}
						type="button"
						onClick={() => setIsExpanded(true)}
						className="flex items-center justify-center rounded-lg border border-white/10 bg-black/60 p-2 backdrop-blur-md transition-all hover:border-white/20 hover:bg-white/10"
						whileHover={{ scale: 1.05 }}
						whileTap={{ scale: 0.95 }}
					>
						<MessageCircleQuestion className="h-5 w-5 text-emerald-400" />
					</motion.button>
				)}
			</AnimatePresence>
		</div>
	);
}
