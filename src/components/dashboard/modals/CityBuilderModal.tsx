import { useState } from "react";
import { Modal } from "#/components/ui/Modal";

const ITEMS = [
	{ id: "tree", label: "Green Tree", cost: 5, emoji: "🌳", effect: "AQI -5" },
	{
		id: "metro",
		label: "Metro Line",
		cost: 30,
		emoji: "🚇",
		effect: "Cars -200",
	},
	{
		id: "solar",
		label: "Solar Panel",
		cost: 15,
		emoji: "☀️",
		effect: "CO₂ -8%",
	},
	{ id: "ev", label: "EV Station", cost: 10, emoji: "⚡", effect: "Cars -50" },
	{ id: "park", label: "Park Zone", cost: 20, emoji: "🏞️", effect: "AQI -10" },
	{
		id: "factory",
		label: "Clean Factory",
		cost: 40,
		emoji: "🏭",
		effect: "PM2.5 -15",
	},
	{
		id: "filter",
		label: "Air Filter",
		cost: 8,
		emoji: "💨",
		effect: "Indoor -30%",
	},
	{ id: "wetland", label: "Wetland", cost: 25, emoji: "🌿", effect: "AQI -8" },
];

const GRADES = [
	{ min: 0, max: 50, label: "A", label2: "Excellent", color: "#22c55e" },
	{ min: 51, max: 100, label: "B", label2: "Good", color: "#84cc16" },
	{ min: 101, max: 150, label: "C", label2: "Moderate", color: "#eab308" },
	{ min: 151, max: 200, label: "D", label2: "Poor", color: "#f97316" },
	{ min: 201, max: 300, label: "F", label2: "Hazardous", color: "#dc2626" },
];

const GRID_SIZE = 8;

export function CityBuilderModal() {
	const [budget] = useState(100);
	const [placed, setPlaced] = useState<
		{ x: number; y: number; item: (typeof ITEMS)[0] }[]
	>([]);
	const [selected, setSelected] = useState<(typeof ITEMS)[0] | null>(null);
	const [hoveredCell, setHoveredCell] = useState<{
		x: number;
		y: number;
	} | null>(null);

	const totalCost = placed.reduce((sum, p) => sum + p.item.cost, 0);
	const remaining = budget - totalCost;

	const getGrade = (): (typeof GRADES)[0] => {
		const score = Math.max(
			0,
			Math.min(
				300,
				180 - placed.length * 8 + (ITEMS.length - placed.length) * 2,
			),
		);
		return (
			GRADES.find((g) => score >= g.min && score <= g.max) ||
			GRADES[GRADES.length - 1]
		);
	};

	const getCellPollution = (x: number, y: number) => {
		let base = 150;
		const nearby = placed.filter(
			(p) =>
				Math.abs(p.x - x) <= 1 &&
				Math.abs(p.y - y) <= 1 &&
				!(p.x === x && p.y === y),
		);
		for (const p of nearby) {
			if (
				p.item.id === "tree" ||
				p.item.id === "park" ||
				p.item.id === "wetland"
			) {
				base -= 20;
			}
			if (p.item.id === "factory") {
				base += 30;
			}
		}
		return Math.max(0, base);
	};

	return (
		<Modal
			id="cityBuilder"
			title="City Builder"
			icon={<span>🏗️</span>}
			accentColor="#a855f7"
			size="lg"
		>
			<div className="space-y-3">
				<div className="flex items-center justify-between rounded-lg border border-white/5 bg-white/[0.02] px-3 py-2">
					<span className="font-mono text-[9px] uppercase tracking-widest text-zinc-500">
						Budget
					</span>
					<span className="font-mono text-sm font-black text-emerald-400">
						{remaining} / {budget} GP
					</span>
				</div>

				<div className="flex items-center justify-between rounded-lg border border-white/5 bg-white/[0.02] px-3 py-2">
					<span className="font-mono text-[9px] uppercase tracking-widest text-zinc-500">
						City Grade
					</span>
					<div className="flex items-center gap-2">
						<span
							className="font-mono text-2xl font-black"
							style={{ color: getGrade().color }}
						>
							{getGrade().label}
						</span>
						<span
							className="font-mono text-[9px]"
							style={{ color: getGrade().color }}
						>
							{getGrade().label2}
						</span>
					</div>
				</div>

				<div
					className="relative mx-auto overflow-hidden rounded-xl border border-white/10"
					style={{ width: GRID_SIZE * 36, maxWidth: "100%" }}
				>
					<svg
						viewBox={`0 0 ${GRID_SIZE * 36} ${GRID_SIZE * 36}`}
						className="w-full cursor-pointer"
						onClick={(e) => {
							if (!selected || remaining < selected.cost) return;
							const rect = e.currentTarget.getBoundingClientRect();
							const x = Math.floor(
								((e.clientX - rect.left) / rect.width) * GRID_SIZE,
							);
							const y = Math.floor(
								((e.clientY - rect.top) / rect.height) * GRID_SIZE,
							);
							setPlaced((prev) => {
								if (prev.some((p) => p.x === x && p.y === y)) return prev;
								return [...prev, { x, y, item: selected }];
							});
						}}
					>
						{Array.from({ length: GRID_SIZE * GRID_SIZE }).map((_, i) => {
							const x = i % GRID_SIZE;
							const y = Math.floor(i / GRID_SIZE);
							const pollution = getCellPollution(x, y);
							const isPlaced = placed.find((p) => p.x === x && p.y === y);
							const isHovered = hoveredCell?.x === x && hoveredCell?.y === y;
							const gradeColor =
								pollution <= 50
									? "#22c55e"
									: pollution <= 100
										? "#84cc16"
										: pollution <= 150
											? "#eab308"
											: pollution <= 200
												? "#f97316"
												: "#dc2626";
							return (
								<g key={i}>
									<rect
										x={x * 36 + 1}
										y={y * 36 + 1}
										width={34}
										height={34}
										rx={3}
										fill={
											isPlaced
												? `${isPlaced.item.id === "factory" ? "#dc2626" : "#22c55e"}15`
												: `${gradeColor}08`
										}
										stroke={
											isPlaced
												? (isPlaced.item.id === "factory"
														? "#dc2626"
														: "#22c55e") + "40"
												: `${gradeColor}20`
										}
										strokeWidth={0.5}
										className="cursor-pointer transition-colors"
										onMouseEnter={() => setHoveredCell({ x, y })}
										onMouseLeave={() => setHoveredCell(null)}
									/>
									{isPlaced && (
										<text
											x={x * 36 + 18}
											y={y * 36 + 24}
											textAnchor="middle"
											fontSize="16"
										>
											{isPlaced.item.emoji}
										</text>
									)}
									{!isPlaced &&
									isHovered &&
									selected !== null &&
									remaining >= selected.cost ? (
										<text
											x={x * 36 + 18}
											y={y * 36 + 24}
											textAnchor="middle"
											fontSize="14"
											opacity={0.4}
										>
											{selected.emoji}
										</text>
									) : null}
								</g>
							);
						})}
					</svg>
				</div>

				<div className="grid grid-cols-4 gap-1">
					{ITEMS.map((item) => {
						const canAfford = remaining >= item.cost;
						return (
							<button
								key={item.id}
								type="button"
								onClick={() =>
									setSelected(selected?.id === item.id ? null : item)
								}
								className={`flex flex-col items-center rounded-lg border p-1.5 transition-all ${
									selected?.id === item.id
										? "border-purple-500 bg-purple-500/10"
										: canAfford
											? "border-white/5 bg-white/[0.02] hover:border-white/10"
											: "border-white/5 opacity-40"
								}`}
							>
								<span className="text-base">{item.emoji}</span>
								<span className="font-mono text-[7px] text-zinc-400">
									{item.label}
								</span>
								<span className="font-mono text-[7px] font-bold text-emerald-400">
									-{item.cost}
								</span>
							</button>
						);
					})}
				</div>

				<div className="flex items-center justify-between rounded-lg border border-white/5 bg-white/[0.02] px-3 py-2">
					<span className="font-mono text-[8px] uppercase text-zinc-500">
						Instructions
					</span>
					<span className="font-mono text-[8px] text-zinc-400">
						Select item below, click grid to place
					</span>
				</div>
			</div>
		</Modal>
	);
}
