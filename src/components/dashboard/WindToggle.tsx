import { motion } from "framer-motion";
import { useEnvStore } from "#/store/envStore";

export function WindToggle() {
	const showWind = useEnvStore((s) => s.showWind);
	const setShowWind = useEnvStore((s) => s.setShowWind);
	const currentWindSpeed = useEnvStore((s) => s.currentWindSpeed);

	return (
		<motion.button
			initial={{ opacity: 0, x: 20 }}
			animate={{ opacity: 1, x: 0 }}
			transition={{ duration: 0.3 }}
			type="button"
			onClick={() => setShowWind(!showWind)}
			className={`pointer-events-auto absolute bottom-4 right-4 z-30 flex items-center gap-2 rounded-2xl border px-3 py-2.5 transition-all backdrop-blur-2xl ${
				showWind
					? "border-sky-500/40 bg-black/90 shadow-lg shadow-sky-500/10"
					: "border-white/10 bg-black/80 hover:border-white/20"
			}`}
		>
			<div className="relative flex h-4 w-4 items-center justify-center">
				<svg
					className={`h-4 w-4 ${showWind ? "text-sky-400" : "text-zinc-500"}`}
					viewBox="0 0 24 24"
					fill="none"
					stroke="currentColor"
					strokeWidth="2"
					aria-hidden="true"
				>
					<path d="M9.59 4.59A2 2 0 1 1 11 8H2" />
					<path d="M14 16H2" />
					<path d="M17.5 12H2" />
					<path d="M22 8H19" />
				</svg>
				{showWind && (
					<div className="absolute -inset-1 animate-ping rounded-full border border-sky-400/30" />
				)}
			</div>
			<div className="flex flex-col items-start">
				<span
					className={`font-mono text-[10px] font-bold transition-colors ${
						showWind ? "text-sky-300" : "text-zinc-400"
					}`}
				>
					{showWind ? "Wind" : "Wind"}
				</span>
				{showWind && currentWindSpeed != null && (
					<span className="font-mono text-[8px] text-sky-500">
						{Math.round(currentWindSpeed)} km/h
					</span>
				)}
			</div>
			<div
				className={`h-1.5 w-1.5 rounded-full transition-colors ${
					showWind ? "bg-sky-400 animate-pulse" : "bg-zinc-600"
				}`}
			/>
		</motion.button>
	);
}
