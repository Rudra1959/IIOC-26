import { motion } from "framer-motion";
import { Building2, User } from "lucide-react";
import { useFeatureStore } from "#/store/featureStore";

export function ModeSwitcher() {
	const mode = useFeatureStore((s) => s.mode);
	const setMode = useFeatureStore((s) => s.setMode);

	return (
		<motion.button
			type="button"
			onClick={() => setMode(mode === "citizen" ? "government" : "citizen")}
			className="group relative flex items-center gap-1.5 rounded-full border border-white/10 bg-black/60 px-3 py-2 backdrop-blur-md transition-all hover:border-white/20"
			whileTap={{ scale: 0.97 }}
		>
			<div className="flex items-center gap-1">
				<User
					className="h-3.5 w-3.5 transition-colors"
					style={{ color: mode === "citizen" ? "#22c55e" : "#52525b" }}
				/>
				<span
					className="font-mono text-[10px] font-bold uppercase tracking-wider transition-colors"
					style={{ color: mode === "citizen" ? "#22c55e" : "#52525b" }}
				>
					Citizen
				</span>
			</div>

			<div className="h-3 w-px bg-white/10" />

			<div className="flex items-center gap-1">
				<Building2
					className="h-3.5 w-3.5 transition-colors"
					style={{ color: mode === "government" ? "#f59e0b" : "#52525b" }}
				/>
				<span
					className="font-mono text-[10px] font-bold uppercase tracking-wider transition-colors"
					style={{ color: mode === "government" ? "#f59e0b" : "#52525b" }}
				>
					Government
				</span>
			</div>

			<div
				className="absolute bottom-0 left-0 h-0.5 rounded-full transition-all duration-300"
				style={{
					width: "50%",
					left: mode === "citizen" ? "0" : "50%",
					background: mode === "citizen" ? "#22c55e" : "#f59e0b",
				}}
			/>

			<span className="absolute -bottom-8 left-1/2 -translate-x-1/2 whitespace-nowrap rounded bg-black/90 px-2 py-1 font-mono text-[9px] font-bold uppercase tracking-wider text-white opacity-0 shadow-lg transition-opacity group-hover:opacity-100 pointer-events-none z-50">
				{mode === "citizen" ? "Switch to Government" : "Switch to Citizen"}
			</span>
		</motion.button>
	);
}
