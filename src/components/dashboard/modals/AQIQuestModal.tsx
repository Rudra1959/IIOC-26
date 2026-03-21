import { useState } from "react";
import { Modal } from "#/components/ui/Modal";

const BOSS = {
	name: "Steel Smog Lord",
	hp: 1000,
	maxHp: 1000,
	aqi: 312,
	emoji: "🏭",
};

const ATTACKS = [
	{
		id: "venti",
		name: "Venti Blast",
		emoji: "💨",
		dmg: 30,
		desc: "Wind disperses 50 AQI",
		effect: "boss",
	},
	{
		id: "tree",
		name: "Forest Surge",
		emoji: "🌲",
		dmg: 80,
		desc: "Trees absorb PM2.5",
		effect: "boss",
	},
	{
		id: "rain",
		name: "Acid Rain",
		emoji: "🌧️",
		dmg: -20,
		desc: "Reduces visibility",
		effect: "player",
	},
	{
		id: "ev",
		name: "EV Charge",
		emoji: "⚡",
		dmg: 60,
		desc: "Reduces NO₂ emissions",
		effect: "boss",
	},
	{
		id: "filter",
		name: "HEPA Storm",
		emoji: "💨",
		dmg: 100,
		desc: "Cleans 80% of particles",
		effect: "boss",
	},
	{
		id: "sun",
		name: "UV Strike",
		emoji: "☀️",
		dmg: 45,
		desc: "Reduces O₃",
		effect: "boss",
	},
];

// eslint-disable-next-line @typescript-eslint/no-unused-vars
const ENEMIES = [
	{ name: "Traffic Smoke", hp: 200, aqi: 180, emoji: "🚗" },
	{ name: "Factory Cloud", hp: 350, aqi: 280, emoji: "🏗️" },
	{ name: "Dust Storm", hp: 250, aqi: 220, emoji: "🌪️" },
];

export function AQIQuestModal() {
	const [playerHp, setPlayerHp] = useState(100);
	const [bossHp, setBossHp] = useState(BOSS.maxHp);
	const [log, setLog] = useState<{ text: string; color: string }[]>([
		{
			text: "🏭 Steel Smog Lord appears! Prepare for battle!",
			color: "#ef4444",
		},
	]);
	const [xp, setXp] = useState(0);
	const [battleOver, setBattleOver] = useState(false);
	const [usedAttacks, setUsedAttacks] = useState<Set<string>>(new Set());

	const handleAttack = (attack: (typeof ATTACKS)[0]) => {
		if (battleOver) return;
		const dmg = Math.max(0, attack.dmg);
		const newBossHp = Math.max(0, bossHp - dmg);
		const newPlayerHp = Math.max(
			0,
			playerHp + (attack.dmg < 0 ? attack.dmg * -1 : 0),
		);

		setBossHp(newBossHp);
		setPlayerHp(newPlayerHp);
		setUsedAttacks((prev) => new Set([...prev, attack.id]));
		setXp((prev) => prev + Math.max(0, dmg));

		setLog((prev) => [
			...prev,
			{
				text: `⚔️ ${attack.name} hits for ${dmg} AQI damage!`,
				color: "#22c55e",
			},
		]);

		if (newBossHp <= 0) {
			setBattleOver(true);
			setXp((p) => p + 500);
			setLog((prev) => [
				...prev,
				{
					text: "🎉 VICTORY! Steel Smog Lord defeated! +500 XP",
					color: "#fbbf24",
				},
			]);
		} else if (newPlayerHp <= 0) {
			setBattleOver(true);
			setLog((prev) => [
				...prev,
				{
					text: "💀 DEFEAT! Your lungs gave out. Try again!",
					color: "#ef4444",
				},
			]);
		}
	};

	const handleRestart = () => {
		setPlayerHp(100);
		setBossHp(BOSS.maxHp);
		setLog([
			{
				text: "🏭 Steel Smog Lord appears! Prepare for battle!",
				color: "#ef4444",
			},
		]);
		setXp(0);
		setUsedAttacks(new Set());
		setBattleOver(false);
	};

	return (
		<Modal
			id="aqiQuest"
			title="AQI Quest"
			icon={<span>⚔️</span>}
			accentColor="#fbbf24"
			size="lg"
		>
			<div className="space-y-3">
				<div className="flex items-center gap-3">
					<div className="flex-1">
						<div className="mb-1 flex items-center justify-between">
							<span className="font-mono text-[9px] font-bold text-white">
								Eco Guardian
							</span>
							<span className="font-mono text-[9px] text-emerald-400">
								{playerHp} HP
							</span>
						</div>
						<div className="h-2 w-full overflow-hidden rounded-full bg-white/5">
							<div
								className="h-full rounded-full bg-gradient-to-r from-emerald-500 to-green-400 transition-all"
								style={{ width: `${playerHp}%` }}
							/>
						</div>
					</div>
					<div className="flex flex-col items-center">
						<span className="text-3xl">🛡️</span>
						<span className="font-mono text-[7px] text-zinc-500">YOU</span>
					</div>
				</div>

				<div className="flex items-center gap-3">
					<div className="flex flex-col items-center">
						<span className="text-3xl">{BOSS.emoji}</span>
						<span className="font-mono text-[7px] text-zinc-500">BOSS</span>
					</div>
					<div className="flex-1">
						<div className="mb-1 flex items-center justify-between">
							<span className="font-mono text-[9px] font-bold text-red-400">
								{BOSS.name}
							</span>
							<span className="font-mono text-[9px] text-red-400">
								{bossHp} / {BOSS.maxHp}
							</span>
						</div>
						<div className="h-2 w-full overflow-hidden rounded-full bg-white/5">
							<div
								className="h-full rounded-full bg-gradient-to-r from-red-600 to-orange-500 transition-all"
								style={{ width: `${(bossHp / BOSS.maxHp) * 100}%` }}
							/>
						</div>
					</div>
				</div>

				<div className="grid grid-cols-3 gap-1">
					{ATTACKS.map((atk) => (
						<button
							key={atk.id}
							type="button"
							onClick={() => handleAttack(atk)}
							disabled={battleOver || usedAttacks.has(atk.id)}
							className={`flex flex-col items-center rounded-lg border p-1.5 transition-all ${
								usedAttacks.has(atk.id)
									? "border-white/5 opacity-30"
									: battleOver
										? "border-white/5 opacity-30"
										: "border-white/10 bg-white/[0.02] hover:border-yellow-500/40 hover:bg-yellow-500/5"
							}`}
						>
							<span className="text-base">{atk.emoji}</span>
							<span className="font-mono text-[7px] font-bold text-yellow-400">
								{atk.name}
							</span>
							<span className="font-mono text-[6px] text-zinc-500">
								{atk.desc}
							</span>
							<span
								className={`font-mono text-[7px] font-bold ${atk.dmg > 0 ? "text-emerald-400" : "text-red-400"}`}
							>
								{atk.dmg > 0 ? `-${atk.dmg}` : `+${Math.abs(atk.dmg)}`}
							</span>
						</button>
					))}
				</div>

				<div className="space-y-1">
					<p className="font-mono text-[9px] uppercase tracking-widest text-zinc-500">
						Battle Log
					</p>
					<div className="max-h-24 overflow-y-auto rounded-lg border border-white/5 bg-white/[0.02] p-2">
						{log.slice(-6).map((entry, i) => (
							<p
								key={i}
								className="font-mono text-[8px]"
								style={{ color: entry.color }}
							>
								{entry.text}
							</p>
						))}
					</div>
				</div>

				<div className="flex items-center justify-between">
					<div className="flex items-center gap-2">
						<span className="font-mono text-[9px] uppercase tracking-widest text-zinc-500">
							XP: {xp}
						</span>
						<div className="h-1.5 w-32 overflow-hidden rounded-full bg-white/5">
							<div
								className="h-full rounded-full bg-yellow-500 transition-all"
								style={{ width: `${Math.min(100, xp % 100)}%` }}
							/>
						</div>
					</div>
					{battleOver && (
						<button
							type="button"
							onClick={handleRestart}
							className="rounded-lg border border-yellow-500/30 bg-yellow-500/10 px-3 py-1 font-mono text-[9px] font-bold text-yellow-400 transition-colors hover:bg-yellow-500/20"
						>
							RESTART
						</button>
					)}
				</div>
			</div>
		</Modal>
	);
}
