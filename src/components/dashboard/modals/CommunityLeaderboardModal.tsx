import { Modal } from "#/components/ui/Modal";

const LEADERS = [
	{
		rank: 1,
		name: "Priya S.",
		city: "Bokaro",
		points: 4820,
		actions: 124,
		badges: ["🌲×50", "🚌×200", "⚡×8"],
	},
	{
		rank: 2,
		name: "Rahul K.",
		city: "Dhanbad",
		points: 4150,
		actions: 98,
		badges: ["🌲×30", "🚌×180"],
	},
	{
		rank: 3,
		name: "Anita M.",
		city: "Ranchi",
		points: 3890,
		actions: 112,
		badges: ["🌲×40", "🚌×150", "💧×5"],
	},
	{
		rank: 4,
		name: "Vikram T.",
		city: "Jamshedpur",
		points: 3420,
		actions: 87,
		badges: ["🌲×20", "🚌×120"],
	},
	{
		rank: 5,
		name: "Sneha P.",
		city: "Bokaro",
		points: 3180,
		actions: 76,
		badges: ["🌲×15", "🚌×100"],
	},
];

const BADGES = [
	{ name: "Tree Planter", icon: "🌲", desc: "Plant trees in city", cost: 50 },
	{ name: "Transit User", icon: "🚌", desc: "Use public transport", cost: 20 },
	{ name: "Energy Saver", icon: "⚡", desc: "Reduce energy usage", cost: 30 },
	{ name: "Water Guardian", icon: "💧", desc: "Conserve water", cost: 25 },
];

export function CommunityLeaderboardModal() {
	return (
		<Modal
			id="communityLeaderboard"
			title="Leaderboard"
			icon={<span>🏆</span>}
			accentColor="#fbbf24"
			size="lg"
		>
			<div className="space-y-4">
				<div className="grid grid-cols-3 gap-2">
					<div className="rounded-lg border border-white/5 bg-white/[0.03] p-3 text-center">
						<p className="font-mono text-[8px] uppercase tracking-widest text-zinc-500">
							Your Rank
						</p>
						<p className="font-mono text-2xl font-black text-yellow-400">#12</p>
					</div>
					<div className="rounded-lg border border-white/5 bg-white/[0.03] p-3 text-center">
						<p className="font-mono text-[8px] uppercase tracking-widest text-zinc-500">
							Total Points
						</p>
						<p className="font-mono text-2xl font-black text-white">2,840</p>
					</div>
					<div className="rounded-lg border border-white/5 bg-white/[0.03] p-3 text-center">
						<p className="font-mono text-[8px] uppercase tracking-widest text-zinc-500">
							Actions
						</p>
						<p className="font-mono text-2xl font-black text-emerald-400">68</p>
					</div>
				</div>

				<div className="space-y-1">
					{LEADERS.map((l) => {
						const isTop3 = l.rank <= 3;
						const colors = ["#fbbf24", "#d1d5db", "#cd7c32"];
						return (
							<div
								key={l.rank}
								className={`flex items-center gap-2 rounded-xl border px-3 py-2.5 transition-colors ${
									isTop3
										? "border-white/10 bg-white/[0.03]"
										: "border-white/5 bg-white/[0.02]"
								}`}
							>
								<span
									className="w-6 text-center font-mono text-[12px] font-black"
									style={{ color: isTop3 ? colors[l.rank - 1] : "#52525b" }}
								>
									#{l.rank}
								</span>

								<div className="flex-1">
									<p className="font-mono text-[11px] font-bold text-white">
										{l.name}
									</p>
									<p className="font-mono text-[9px] text-zinc-600">{l.city}</p>
								</div>

								<div className="flex gap-1">
									{l.badges.map((b, i) => (
										<span
											key={i}
											className="rounded bg-white/5 px-1.5 py-0.5 font-mono text-[9px] text-zinc-400"
										>
											{b}
										</span>
									))}
								</div>

								<div className="text-right">
									<p className="font-mono text-[11px] font-black text-yellow-400">
										{l.points.toLocaleString()}
									</p>
									<p className="font-mono text-[9px] text-zinc-600">pts</p>
								</div>
							</div>
						);
					})}
				</div>

				<div className="space-y-1">
					<p className="font-mono text-[9px] uppercase tracking-widest text-zinc-500">
						Badges Available
					</p>
					<div className="grid grid-cols-2 gap-1">
						{BADGES.map((b) => (
							<div
								key={b.name}
								className="flex items-center gap-2 rounded border border-white/5 bg-white/[0.02] px-3 py-2"
							>
								<span className="text-base">{b.icon}</span>
								<div>
									<p className="font-mono text-[10px] font-bold text-white">
										{b.name}
									</p>
									<p className="font-mono text-[9px] text-zinc-600">{b.desc}</p>
								</div>
								<span className="ml-auto rounded bg-emerald-500/20 px-1.5 py-0.5 font-mono text-[9px] font-bold text-emerald-400">
									{b.cost}pts
								</span>
							</div>
						))}
					</div>
				</div>
			</div>
		</Modal>
	);
}
