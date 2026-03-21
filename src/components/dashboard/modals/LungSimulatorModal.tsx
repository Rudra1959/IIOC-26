import { useEffect, useRef, useState } from "react";
import { Modal } from "#/components/ui/Modal";

export function LungSimulatorModal() {
	const [inhaling, setInhaling] = useState(false);
	const [particles, setParticles] = useState<
		{ id: number; x: number; y: number; opacity: number }[]
	>([]);
	const [totalParticles, setTotalParticles] = useState(0);
	const [inhaleCount, setInhaleCount] = useState(0);
	const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);

	useEffect(() => {
		return () => {
			if (timerRef.current) clearInterval(timerRef.current);
		};
	}, []);

	const handleInhale = () => {
		if (inhaling) return;
		setInhaling(true);
		setInhaleCount((c) => c + 1);

		const newParticles = Array.from({ length: 24 }, (_, i) => ({
			id: Date.now() + i,
			x: 80 + Math.random() * 40,
			y: 60 + Math.random() * 80,
			opacity: 0.3 + Math.random() * 0.7,
		}));

		setParticles((prev) => [...prev, ...newParticles]);
		setTotalParticles((t) => t + 2400);

		setTimeout(() => {
			setInhaling(false);
			setParticles((prev) => prev.slice(12));
		}, 2000);
	};

	return (
		<Modal
			id="lungSimulator"
			title="Lung Simulator"
			icon={<span>🫁</span>}
			accentColor="#06b6d4"
			size="lg"
		>
			<div className="space-y-4">
				<div className="relative">
					<svg viewBox="0 0 200 180" className="w-full">
						<defs>
							<radialGradient id="lungFill" cx="50%" cy="50%" r="50%">
								<stop offset="0%" stopColor="#06b6d4" stopOpacity="0.15" />
								<stop offset="100%" stopColor="#06b6d4" stopOpacity="0.05" />
							</radialGradient>
							<filter id="glow">
								<feGaussianBlur stdDeviation="2" result="coloredBlur" />
								<feMerge>
									<feMergeNode in="coloredBlur" />
									<feMergeNode in="SourceGraphic" />
								</feMerge>
							</filter>
						</defs>

						<ellipse
							cx="65"
							cy="90"
							rx="38"
							ry="52"
							fill="url(#lungFill)"
							stroke="#06b6d4"
							strokeOpacity="0.4"
							strokeWidth="1.5"
						/>
						<ellipse
							cx="135"
							cy="90"
							rx="38"
							ry="52"
							fill="url(#lungFill)"
							stroke="#06b6d4"
							strokeOpacity="0.4"
							strokeWidth="1.5"
						/>

						<ellipse
							cx="65"
							cy="90"
							rx="25"
							ry="38"
							fill="#06b6d4"
							fillOpacity="0.08"
						/>
						<ellipse
							cx="135"
							cy="90"
							rx="25"
							ry="38"
							fill="#06b6d4"
							fillOpacity="0.08"
						/>

						<path
							d="M65 38 Q60 30 65 20 L135 20 Q140 30 135 38"
							stroke="#06b6d4"
							strokeOpacity="0.5"
							strokeWidth="1.5"
							fill="none"
						/>
						<ellipse
							cx="100"
							cy="20"
							rx="35"
							ry="8"
							fill="none"
							stroke="#06b6d4"
							strokeOpacity="0.3"
							strokeWidth="1"
						/>

						<path
							d="M65 142 Q70 155 75 165"
							stroke="#06b6d4"
							strokeOpacity="0.3"
							strokeWidth="1.5"
							fill="none"
						/>
						<path
							d="M135 142 Q130 155 125 165"
							stroke="#06b6d4"
							strokeOpacity="0.3"
							strokeWidth="1.5"
							fill="none"
						/>

						<text
							x="65"
							y="94"
							textAnchor="middle"
							className="fill-cyan-400"
							fontSize="7"
							fontFamily="monospace"
						>
							L
						</text>
						<text
							x="135"
							y="94"
							textAnchor="middle"
							className="fill-cyan-400"
							fontSize="7"
							fontFamily="monospace"
						>
							R
						</text>

						{particles.map((p) => (
							<circle
								key={p.id}
								cx={p.x}
								cy={p.y}
								r={1.5 + Math.random()}
								fill="#f97316"
								fillOpacity={p.opacity}
								filter="url(#glow)"
							>
								<animate
									attributeName="cy"
									from={p.y}
									to={p.y - 30}
									dur="2s"
									fill="freeze"
								/>
								<animate
									attributeName="opacity"
									from={p.opacity}
									to={0}
									dur="2.5s"
									fill="freeze"
								/>
							</circle>
						))}
					</svg>
				</div>

				<button
					type="button"
					onClick={handleInhale}
					disabled={inhaling}
					className={`w-full rounded-xl py-3 font-mono text-[11px] font-bold uppercase tracking-widest transition-all ${
						inhaling
							? "bg-cyan-500/20 text-cyan-300 cursor-not-allowed"
							: "bg-gradient-to-r from-cyan-500 to-teal-500 text-white shadow-lg shadow-cyan-500/30 hover:from-cyan-400 hover:to-teal-400"
					}`}
				>
					{inhaling ? "⟨ Inhaling... ⟩" : "⟨ Inhale Now ⟩"}
				</button>

				<div className="grid grid-cols-2 gap-2">
					<div className="rounded-lg border border-white/5 bg-white/[0.03] p-3 text-center">
						<p className="font-mono text-[8px] uppercase tracking-widest text-zinc-500">
							Particles/Breath
						</p>
						<p className="font-mono text-lg font-black text-orange-400">
							~{inhaleCount > 0 ? "2,400" : "—"}
						</p>
					</div>
					<div className="rounded-lg border border-white/5 bg-white/[0.03] p-3 text-center">
						<p className="font-mono text-[8px] uppercase tracking-widest text-zinc-500">
							Total Inhaled
						</p>
						<p className="font-mono text-lg font-black text-red-400">
							{totalParticles.toLocaleString()}
						</p>
					</div>
				</div>

				<div className="space-y-1.5">
					<p className="font-mono text-[9px] uppercase tracking-widest text-zinc-500">
						Health Risk Timeline
					</p>
					{[
						{
							time: "1 hour",
							risk: "Low",
							color: "#22c55e",
							note: "Minor irritation",
						},
						{
							time: "4 hours",
							risk: "Moderate",
							color: "#eab308",
							note: "Breathing difficulty",
						},
						{
							time: "8 hours",
							risk: "High",
							color: "#f97316",
							note: "Respiratory stress",
						},
						{
							time: "24 hours",
							risk: "Severe",
							color: "#dc2626",
							note: "Chronic exposure",
						},
					].map((item) => (
						<div
							key={item.time}
							className="flex items-center gap-2 rounded border border-white/5 bg-white/[0.02] px-3 py-1.5"
						>
							<span className="w-16 font-mono text-[10px] text-zinc-500">
								{item.time}
							</span>
							<div
								className="h-1 w-12 rounded-full"
								style={{ backgroundColor: item.color }}
							/>
							<span
								className="font-mono text-[10px] font-bold"
								style={{ color: item.color }}
							>
								{item.risk}
							</span>
							<span className="ml-auto font-mono text-[9px] text-zinc-600">
								{item.note}
							</span>
						</div>
					))}
				</div>

				<div className="space-y-1.5">
					<p className="font-mono text-[9px] uppercase tracking-widest text-zinc-500">
						Mask Effectiveness
					</p>
					{[
						{ name: "N95 Mask", block: 95, color: "#22c55e" },
						{ name: "Surgical Mask", block: 60, color: "#eab308" },
						{ name: "No Mask", block: 0, color: "#dc2626" },
					].map((mask) => (
						<div key={mask.name} className="flex items-center gap-2">
							<span className="w-24 font-mono text-[10px] text-zinc-400">
								{mask.name}
							</span>
							<div className="h-2 flex-1 overflow-hidden rounded-full bg-white/5">
								<div
									className="h-full rounded-full"
									style={{
										width: `${mask.block}%`,
										backgroundColor: mask.color,
									}}
								/>
							</div>
							<span
								className="w-8 text-right font-mono text-[10px] font-bold"
								style={{ color: mask.color }}
							>
								{mask.block}%
							</span>
						</div>
					))}
				</div>
			</div>
		</Modal>
	);
}
