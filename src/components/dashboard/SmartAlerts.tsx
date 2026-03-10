import { AnimatePresence, motion } from "framer-motion";
import { BellRing, ShieldAlert, X, Zap } from "lucide-react";
import { useState } from "react";

export function SmartAlerts() {
	const [isOpen, setIsOpen] = useState(false);
	const [threshold, setThreshold] = useState(70);

	return (
		<>
			<button
				type="button"
				onClick={() => setIsOpen(true)}
				className="pointer-events-auto absolute top-20 left-4 z-20 rounded-2xl border border-white/10 bg-[#09090b]/80 p-3 shadow-xl backdrop-blur-xl transition-colors hover:bg-white/10 group"
			>
				<BellRing className="h-5 w-5 text-zinc-400 transition-colors group-hover:text-emerald-400" />
				<div className="absolute top-2 right-2 h-2 w-2 rounded-full bg-emerald-500 animate-pulse" />
			</button>

			<AnimatePresence>
				{isOpen && (
					<motion.div
						initial={{ opacity: 0, scale: 0.95, x: -20 }}
						animate={{ opacity: 1, scale: 1, x: 0 }}
						exit={{ opacity: 0, scale: 0.95, x: -20 }}
						className="pointer-events-auto absolute top-20 left-20 z-50 w-80 rounded-2xl border border-white/10 bg-[#09090b]/95 p-5 text-white shadow-2xl backdrop-blur-3xl"
					>
						<div className="mb-5 flex items-center justify-between">
							<h3 className="flex items-center gap-2 font-bold">
								<ShieldAlert className="h-4 w-4 text-emerald-400" />
								Smart Triggers
							</h3>
							<button
								type="button"
								onClick={() => setIsOpen(false)}
								className="cursor-pointer rounded-lg p-1 text-zinc-400 transition-colors hover:bg-white/10"
							>
								<X className="h-4 w-4" />
							</button>
						</div>

						<div className="space-y-5">
							<div className="rounded-xl border border-white/5 bg-white/5 p-4">
								<div className="mb-3 flex items-center justify-between">
									<span className="text-sm font-medium text-zinc-300">
										AQI Danger Alert
									</span>
									<span className="rounded bg-red-500/20 px-2 py-0.5 text-xs font-bold text-red-400">
										&gt;{threshold}
									</span>
								</div>
								<input
									type="range"
									min="0"
									max="200"
									value={threshold}
									onChange={(event) =>
										setThreshold(Number.parseInt(event.target.value, 10))
									}
									className="h-1 w-full cursor-pointer appearance-none rounded-lg bg-zinc-800 accent-emerald-500"
								/>
								<p className="mt-2 text-center text-[10px] text-zinc-500">
									Alert me when Air Quality breaches {threshold}
								</p>
							</div>

							<div className="flex items-start gap-3 rounded-xl border border-emerald-500/20 bg-gradient-to-r from-emerald-500/10 to-transparent p-4">
								<Zap className="h-5 w-5 shrink-0 text-emerald-400" />
								<div>
									<p className="mb-1 text-sm font-bold text-emerald-400">
										Hyper-local push enabled
									</p>
									<p className="text-xs leading-relaxed text-zinc-400">
										Notifications will route to your device if an anomaly enters
										your 500m radius.
									</p>
								</div>
							</div>
						</div>
					</motion.div>
				)}
			</AnimatePresence>
		</>
	);
}
