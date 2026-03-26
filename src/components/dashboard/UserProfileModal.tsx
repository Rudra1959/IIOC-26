import { AnimatePresence, motion } from "framer-motion";
import {
	Award,
	Calendar,
	Flame,
	Lock,
	MapPin,
	Star,
	Target,
	TrendingUp,
	Trophy,
	X,
	Zap,
} from "lucide-react";
import { useEffect, useState } from "react";
import { BADGES, getBadgeProgress } from "#/lib/badges";
import { useGamificationStore } from "#/store/gamificationStore";

interface UserProfileModalProps {
	isOpen: boolean;
	onClose: () => void;
}

export function UserProfileModal({ isOpen, onClose }: UserProfileModalProps) {
	const [activeTab, setActiveTab] = useState<"profile" | "badges" | "missions">(
		"profile",
	);
	const {
		xp,
		level,
		streak,
		longestStreak,
		badges,
		dailyMissions,
		completedCleanups,
		explorations,
		totalXpEarned,
		getXpProgress,
		checkIn,
	} = useGamificationStore();

	const xpProgress = getXpProgress();
	const xpForNextLevel = useGamificationStore
		.getState()
		.getXpForNextLevel(level);
	const currentLevelXp = useGamificationStore
		.getState()
		.getXpForNextLevel(level - 1);
	const xpIntoLevel = xp - currentLevelXp;

	useEffect(() => {
		if (isOpen) {
			checkIn();
			useGamificationStore.getState().refreshDailyMissions();
		}
	}, [isOpen, checkIn]);

	const earnedBadges = BADGES.filter((b) => badges.includes(b.id));
	const lockedBadges = BADGES.filter((b) => !badges.includes(b.id));

	if (!isOpen) return null;

	return (
		<AnimatePresence>
			<motion.div
				initial={{ opacity: 0 }}
				animate={{ opacity: 1 }}
				exit={{ opacity: 0 }}
				className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm"
				onClick={onClose}
			>
				<motion.div
					initial={{ opacity: 0, scale: 0.95, y: 20 }}
					animate={{ opacity: 1, scale: 1, y: 0 }}
					exit={{ opacity: 0, scale: 0.95, y: 20 }}
					transition={{ duration: 0.3, ease: [0.16, 1, 0.3, 1] }}
					className="relative w-full max-w-lg overflow-hidden rounded-2xl border border-white/10 bg-[#111111] shadow-2xl"
					onClick={(e) => e.stopPropagation()}
				>
					<div className="absolute top-0 left-0 right-0 h-24 bg-gradient-to-br from-teal-500/30 via-cyan-500/20 to-blue-500/30" />

					<button
						type="button"
						onClick={onClose}
						className="absolute right-3 top-3 z-10 rounded-lg bg-black/40 p-2 text-zinc-400 transition-colors hover:bg-black/60 hover:text-white"
					>
						<X className="h-4 w-4" />
					</button>

					<div className="relative p-6 pt-16">
						<div className="mb-6 flex items-center gap-4">
							<div className="flex h-20 w-20 items-center justify-center rounded-full border-4 border-teal-500/50 bg-black shadow-lg shadow-teal-500/20">
								<span className="text-3xl font-bold text-teal-400">
									{level}
								</span>
							</div>
							<div className="flex-1">
								<h2 className="text-xl font-bold text-white">Eco-Warrior</h2>
								<p className="text-sm text-zinc-400">Level {level}</p>
								<div className="mt-2 flex items-center gap-2">
									<div className="h-2 flex-1 overflow-hidden rounded-full bg-white/10">
										<div
											className="h-full rounded-full bg-gradient-to-r from-teal-400 to-cyan-400 transition-all duration-500"
											style={{ width: `${xpProgress * 100}%` }}
										/>
									</div>
									<span className="text-[10px] text-zinc-500">
										{xpIntoLevel}/{xpForNextLevel} XP
									</span>
								</div>
							</div>
						</div>

						<div className="mb-6 grid grid-cols-4 gap-2">
							<div className="rounded-xl border border-white/10 bg-white/5 p-3 text-center">
								<Flame className="mx-auto mb-1 h-5 w-5 text-orange-400" />
								<p className="text-lg font-bold text-white">{streak}</p>
								<p className="text-[8px] uppercase tracking-wider text-zinc-500">
									Streak
								</p>
							</div>
							<div className="rounded-xl border border-white/10 bg-white/5 p-3 text-center">
								<Star className="mx-auto mb-1 h-5 w-5 text-yellow-400" />
								<p className="text-lg font-bold text-white">{totalXpEarned}</p>
								<p className="text-[8px] uppercase tracking-wider text-zinc-500">
									XP
								</p>
							</div>
							<div className="rounded-xl border border-white/10 bg-white/5 p-3 text-center">
								<Target className="mx-auto mb-1 h-5 w-5 text-green-400" />
								<p className="text-lg font-bold text-white">
									{completedCleanups}
								</p>
								<p className="text-[8px] uppercase tracking-wider text-zinc-500">
									Cleanups
								</p>
							</div>
							<div className="rounded-xl border border-white/10 bg-white/5 p-3 text-center">
								<MapPin className="mx-auto mb-1 h-5 w-5 text-purple-400" />
								<p className="text-lg font-bold text-white">{explorations}</p>
								<p className="text-[8px] uppercase tracking-wider text-zinc-500">
									Explore
								</p>
							</div>
						</div>

						<div className="mb-4 flex gap-1 rounded-lg bg-white/5 p-1">
							{(["profile", "badges", "missions"] as const).map((tab) => (
								<button
									key={tab}
									type="button"
									onClick={() => setActiveTab(tab)}
									className={`flex-1 rounded-md py-2 text-[10px] font-medium uppercase tracking-wider transition-colors ${
										activeTab === tab
											? "bg-teal-500/20 text-teal-400"
											: "text-zinc-500 hover:text-zinc-300"
									}`}
								>
									{tab}
								</button>
							))}
						</div>

						<div className="max-h-[280px] overflow-y-auto">
							{activeTab === "profile" && (
								<div className="space-y-3">
									<div className="rounded-xl border border-white/10 bg-white/5 p-4">
										<div className="flex items-center justify-between">
											<div className="flex items-center gap-2">
												<Trophy className="h-4 w-4 text-amber-400" />
												<span className="text-sm text-zinc-300">
													Best Streak
												</span>
											</div>
											<span className="font-bold text-white">
												{longestStreak} days
											</span>
										</div>
									</div>
									<div className="rounded-xl border border-white/10 bg-white/5 p-4">
										<div className="flex items-center justify-between">
											<div className="flex items-center gap-2">
												<Calendar className="h-4 w-4 text-cyan-400" />
												<span className="text-sm text-zinc-300">
													Member Since
												</span>
											</div>
											<span className="font-bold text-white">Today</span>
										</div>
									</div>
									<div className="rounded-xl border border-white/10 bg-white/5 p-4">
										<div className="flex items-center justify-between">
											<div className="flex items-center gap-2">
												<TrendingUp className="h-4 w-4 text-green-400" />
												<span className="text-sm text-zinc-300">Rank</span>
											</div>
											<span className="font-bold text-white">#1</span>
										</div>
									</div>
								</div>
							)}

							{activeTab === "badges" && (
								<div className="space-y-3">
									{earnedBadges.length > 0 && (
										<div>
											<p className="mb-2 text-[10px] uppercase tracking-wider text-zinc-500">
												Earned ({earnedBadges.length})
											</p>
											<div className="grid grid-cols-4 gap-2">
												{earnedBadges.map((badge) => (
													<div
														key={badge.id}
														className="flex flex-col items-center rounded-xl border border-teal-500/30 bg-teal-500/10 p-2"
														title={badge.description}
													>
														<span className="text-xl">{badge.icon}</span>
														<span className="text-[8px] text-center text-zinc-400 truncate w-full">
															{badge.name}
														</span>
													</div>
												))}
											</div>
										</div>
									)}
									{lockedBadges.length > 0 && (
										<div>
											<p className="mb-2 text-[10px] uppercase tracking-wider text-zinc-500">
												Locked ({lockedBadges.length})
											</p>
											<div className="grid grid-cols-4 gap-2">
												{lockedBadges.map((badge) => {
													const progress = getBadgeProgress(badge, {
														cleanups: completedCleanups,
														streak: streak,
														level: level,
														explorations: explorations,
														badges: badges.length,
													});
													return (
														<div
															key={badge.id}
															className="relative flex flex-col items-center rounded-xl border border-white/10 bg-white/5 p-2 opacity-60"
															title={badge.description}
														>
															<span className="text-xl grayscale">
																{badge.icon}
															</span>
															<span className="text-[8px] text-center text-zinc-500 truncate w-full">
																{badge.name}
															</span>
															{progress > 0 && (
																<div className="absolute bottom-0 left-0 right-0 h-0.5 bg-white/10">
																	<div
																		className="h-full bg-teal-500"
																		style={{ width: `${progress * 100}%` }}
																	/>
																</div>
															)}
														</div>
													);
												})}
											</div>
										</div>
									)}
								</div>
							)}

							{activeTab === "missions" && (
								<div className="space-y-3">
									{dailyMissions.map((mission) => (
										<div
											key={mission.id}
											className={`rounded-xl border p-4 transition-all ${
												mission.completed
													? "border-emerald-500/30 bg-emerald-500/10"
													: "border-white/10 bg-white/5"
											}`}
										>
											<div className="flex items-center justify-between">
												<div className="flex items-center gap-2">
													{mission.completed ? (
														<Award className="h-4 w-4 text-emerald-400" />
													) : (
														<Zap className="h-4 w-4 text-zinc-500" />
													)}
													<div>
														<p className="text-sm font-medium text-white">
															{mission.title}
														</p>
														<p className="text-[10px] text-zinc-500">
															{mission.description}
														</p>
													</div>
												</div>
												<div className="text-right">
													<p className="text-[10px] font-medium text-teal-400">
														+{mission.xpReward} XP
													</p>
													<p className="text-[8px] text-zinc-500">
														{mission.progress}/{mission.target}
													</p>
												</div>
											</div>
											<div className="mt-2 h-1 overflow-hidden rounded-full bg-white/10">
												<div
													className={`h-full transition-all ${
														mission.completed ? "bg-emerald-400" : "bg-teal-400"
													}`}
													style={{
														width: `${(mission.progress / mission.target) * 100}%`,
													}}
												/>
											</div>
										</div>
									))}
								</div>
							)}
						</div>
					</div>
				</motion.div>
			</motion.div>
		</AnimatePresence>
	);
}
