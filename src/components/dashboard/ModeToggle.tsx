import { motion } from "framer-motion";
import { BarChart3, Gamepad2, Radar } from "lucide-react";
import { useEnvStore } from "#/store/envStore";

export function ModeToggle() {
	const appMode = useEnvStore((s) => s.appMode);
	const setAppMode = useEnvStore((s) => s.setAppMode);

	const modes = [
		{
			id: "monitor" as const,
			label: "Monitor",
			icon: Radar,
			color: "#22c55e",
			desc: "Map, AQI, Weather",
		},
		{
			id: "analyze" as const,
			label: "Analyze",
			icon: BarChart3,
			color: "#3b82f6",
			desc: "DNA, Chem Lab, News",
		},
		{
			id: "act" as const,
			label: "Act",
			icon: Gamepad2,
			color: "#f59e0b",
			desc: "Games, Policy Sim",
		},
	];

	return (
		<div className="flex items-center gap-1 p-1 rounded-xl border border-white/10 bg-black/60 backdrop-blur-md">
			{modes.map((mode) => (
				<motion.button
					key={mode.id}
					type="button"
					onClick={() => setAppMode(mode.id)}
					className={`relative flex items-center gap-2 rounded-lg px-4 py-2 text-xs font-bold transition-all ${
						appMode === mode.id
							? "bg-white/10"
							: "hover:bg-white/5 text-zinc-400"
					}`}
					whileTap={{ scale: 0.97 }}
				>
					{appMode === mode.id && (
						<motion.div
							layoutId="activeModeHorizontal"
							className="absolute inset-0 rounded-lg"
							style={{ backgroundColor: `${mode.color}15` }}
							transition={{ type: "spring", bounce: 0.2, duration: 0.6 }}
						/>
					)}
					<mode.icon
						className="h-4 w-4 relative z-10"
						style={{
							color: appMode === mode.id ? mode.color : "#71717a",
						}}
					/>
					<span
						className="relative z-10 font-mono text-[10px]"
						style={{
							color: appMode === mode.id ? mode.color : "#71717a",
						}}
					>
						{mode.label}
					</span>
				</motion.button>
			))}
		</div>
	);
}
