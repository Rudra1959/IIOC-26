import { motion } from "framer-motion";
import { useFeatureStore } from "#/store/featureStore";

const WIDGETS = [
	{
		id: "alerts",
		label: "Alerts",
		icon: "🔔",
		color: "#ef4444",
		citizen: true,
		gov: true,
	},
	{
		id: "globalRank",
		label: "Rank",
		icon: "🌍",
		color: "#22c55e",
		citizen: true,
		gov: false,
	},
	{
		id: "airPassport",
		label: "Passport",
		icon: "✈️",
		color: "#38bdf8",
		citizen: true,
		gov: false,
	},
	{
		id: "cityDuel",
		label: "Duel",
		icon: "⚔️",
		color: "#f97316",
		citizen: true,
		gov: false,
	},
	{
		id: "lungSimulator",
		label: "Lungs",
		icon: "🫁",
		color: "#06b6d4",
		citizen: true,
		gov: false,
	},
	{
		id: "bodyXRay",
		label: "Body X",
		icon: "🫀",
		color: "#ec4899",
		citizen: true,
		gov: false,
	},
	{
		id: "hospitalNetwork",
		label: "Hospitals",
		icon: "🏥",
		color: "#f43f5e",
		citizen: true,
		gov: true,
	},
	{
		id: "timeMachine",
		label: "History",
		icon: "⏳",
		color: "#a78bfa",
		citizen: true,
		gov: true,
	},
	{
		id: "pollutionDNA",
		label: "DNA",
		icon: "🧬",
		color: "#8b5cf6",
		citizen: true,
		gov: true,
	},
	{
		id: "radar",
		label: "Radar",
		icon: "📡",
		color: "#0ea5e9",
		citizen: true,
		gov: true,
	},
	{
		id: "satellite",
		label: "Satellite",
		icon: "🔭",
		color: "#6366f1",
		citizen: false,
		gov: true,
	},
	{
		id: "aqiMarket",
		label: "Market",
		icon: "📈",
		color: "#14b8a6",
		citizen: true,
		gov: false,
	},
	{
		id: "carbonTracker",
		label: "Carbon",
		icon: "🌿",
		color: "#84cc16",
		citizen: true,
		gov: false,
	},
	{
		id: "citizenReport",
		label: "Report",
		icon: "📡",
		color: "#f59e0b",
		citizen: true,
		gov: false,
	},
	{
		id: "communityLeaderboard",
		label: "Leaderboard",
		icon: "🏆",
		color: "#fbbf24",
		citizen: true,
		gov: false,
	},
	{
		id: "pollutionNews",
		label: "News",
		icon: "📰",
		color: "#e879f9",
		citizen: true,
		gov: true,
	},
	{
		id: "aqiMusic",
		label: "Music",
		icon: "🎵",
		color: "#f472b6",
		citizen: true,
		gov: false,
	},
	{
		id: "aiAssistant",
		label: "AI",
		icon: "◈",
		color: "#818cf8",
		citizen: true,
		gov: true,
	},
	{
		id: "aiOracle",
		label: "Oracle",
		icon: "🔮",
		color: "#c084fc",
		citizen: true,
		gov: true,
	},
	{
		id: "chemLab",
		label: "Chem Lab",
		icon: "🧪",
		color: "#fb923c",
		citizen: false,
		gov: true,
	},
	{
		id: "ghostCities",
		label: "Ghost Cities",
		icon: "👻",
		color: "#6b7280",
		citizen: true,
		gov: false,
	},
	{
		id: "cityBuilder",
		label: "City Builder",
		icon: "🏙️",
		color: "#10b981",
		citizen: true,
		gov: false,
	},
	{
		id: "aqiQuest",
		label: "Quest",
		icon: "🎮",
		color: "#eab308",
		citizen: true,
		gov: false,
	},
	{
		id: "nightMode",
		label: "Night",
		icon: "🌙",
		color: "#6366f1",
		citizen: true,
		gov: true,
	},
] as const;

export function TopWidgetBar() {
	const mode = useFeatureStore((s) => s.mode);
	const openModals = useFeatureStore((s) => s.openModals);
	const toggleModal = useFeatureStore((s) => s.toggleModal);
	const nightMode = useFeatureStore((s) => s.nightMode);
	const setNightMode = useFeatureStore((s) => s.setNightMode);

	const visibleWidgets = WIDGETS.filter((w) => {
		if (w.id === "nightMode") return true;
		if (mode === "citizen") return w.citizen;
		if (mode === "government") return w.gov;
		return false;
	});

	return (
		<motion.div
			initial={{ opacity: 0, y: -12, scale: 0.95 }}
			animate={{ opacity: 1, y: 0, scale: 1 }}
			transition={{ duration: 0.4, ease: [0.16, 1, 0.3, 1] }}
			className="pointer-events-auto absolute left-1/2 top-20 z-40 -translate-x-1/2"
		>
			<div className="flex items-center gap-1 rounded-full border border-white/10 bg-black/80 px-2 py-1.5 shadow-xl backdrop-blur-2xl">
				{visibleWidgets.map((widget) => {
					const isOpen =
						widget.id === "nightMode"
							? nightMode
							: openModals.has(widget.id as any);
					const isNight = widget.id === "nightMode";

					return (
						<button
							key={widget.id}
							type="button"
							onClick={() => {
								if (isNight) {
									setNightMode(!nightMode);
								} else {
									toggleModal(widget.id as any);
								}
							}}
							className={`group relative flex h-8 w-8 items-center justify-center rounded-full text-sm transition-all ${
								isOpen ? "bg-white/10 shadow-lg" : "hover:bg-white/5"
							}`}
							style={
								isOpen
									? { boxShadow: `0 0 12px 2px ${widget.color}40` }
									: undefined
							}
							title={widget.label}
						>
							<span style={{ color: isOpen ? widget.color : "#71717a" }}>
								{widget.icon}
							</span>
							<span className="absolute -bottom-7 left-1/2 -translate-x-1/2 whitespace-nowrap rounded bg-black/90 px-1.5 py-0.5 font-mono text-[9px] font-bold uppercase tracking-wider text-white opacity-0 shadow-lg transition-opacity group-hover:opacity-100 pointer-events-none z-50">
								{widget.label}
							</span>
						</button>
					);
				})}
			</div>
		</motion.div>
	);
}
