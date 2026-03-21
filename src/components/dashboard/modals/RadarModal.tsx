import { useEffect, useRef, useState } from "react";
import { Modal } from "#/components/ui/Modal";

const STATIONS = Array.from({ length: 24 }, (_, i) => {
	const angle = (i / 24) * Math.PI * 2;
	const r = 60 + Math.random() * 30;
	return {
		id: i,
		x: 100 + Math.cos(angle) * r,
		y: 100 + Math.sin(angle) * r,
		status: Math.random() > 0.1 ? "normal" : "alert",
		name: `Station-${i + 1}`,
	};
});

export function RadarModal() {
	const [angle, setAngle] = useState(0);
	const [range, setRange] = useState(100);
	const [layer, setLayer] = useState<"aqi" | "co" | "no2" | "pm25">("aqi");
	const animationRef = useRef<number | null>(null);

	useEffect(() => {
		const animate = () => {
			setAngle((a) => (a + 1) % 360);
			animationRef.current = requestAnimationFrame(animate);
		};
		animationRef.current = requestAnimationFrame(animate);
		return () => {
			if (animationRef.current) cancelAnimationFrame(animationRef.current);
		};
	}, []);

	const alerts = STATIONS.filter((s) => s.status === "alert");

	return (
		<Modal
			id="radar"
			title="Live Radar"
			icon={<span>📡</span>}
			accentColor="#0ea5e9"
			size="lg"
		>
			<div className="space-y-4">
				<div className="flex gap-2">
					{(["aqi", "co", "no2", "pm25"] as const).map((l) => (
						<button
							key={l}
							type="button"
							onClick={() => setLayer(l)}
							className={`flex-1 rounded border px-2 py-1.5 font-mono text-[10px] font-bold uppercase transition-colors ${
								layer === l
									? "border-sky-500/50 bg-sky-500/10 text-sky-300"
									: "border-white/5 bg-white/[0.02] text-zinc-500 hover:border-white/10"
							}`}
						>
							{l.toUpperCase()}
						</button>
					))}
				</div>

				<div className="relative">
					<svg viewBox="0 0 200 200" className="w-full">
						<defs>
							<radialGradient id="radarGrad" cx="50%" cy="50%" r="50%">
								<stop offset="0%" stopColor="#0ea5e9" stopOpacity="0.3" />
								<stop offset="100%" stopColor="#0ea5e9" stopOpacity="0" />
							</radialGradient>
						</defs>

						<circle
							cx="100"
							cy="100"
							r="95"
							fill="#0a1628"
							stroke="#1e3a5f"
							strokeWidth="1"
						/>
						<circle
							cx="100"
							cy="100"
							r="70"
							fill="none"
							stroke="#1e3a5f"
							strokeWidth="0.5"
						/>
						<circle
							cx="100"
							cy="100"
							r="45"
							fill="none"
							stroke="#1e3a5f"
							strokeWidth="0.5"
						/>
						<circle
							cx="100"
							cy="100"
							r="20"
							fill="none"
							stroke="#1e3a5f"
							strokeWidth="0.5"
						/>

						{[0, 45, 90, 135, 180, 225, 270, 315].map((deg) => {
							const rad = (deg * Math.PI) / 180;
							return (
								<line
									key={deg}
									x1={100}
									y1={100}
									x2={100 + Math.cos(rad) * 95}
									y2={100 + Math.sin(rad) * 95}
									stroke="#1e3a5f"
									strokeWidth="0.5"
								/>
							);
						})}

						<path
							d={`M100,100 L${100 + Math.cos((angle * Math.PI) / 180) * 95},${100 + Math.sin((angle * Math.PI) / 180) * 95}`}
							stroke="#0ea5e9"
							strokeWidth="1"
							strokeOpacity="0.8"
							fill="none"
						/>
						<path
							d={`M100,100 A${Math.min(95, range)},${Math.min(95, range)} 0 0,1 ${100 + Math.cos(((angle - 45) * Math.PI) / 180) * Math.min(95, range)},${100 + Math.sin(((angle - 45) * Math.PI) / 180) * Math.min(95, range)} Z`}
							fill="url(#radarGrad)"
						/>

						{STATIONS.filter((s) => {
							const dx = s.x - 100;
							const dy = s.y - 100;
							const dist = Math.sqrt(dx * dx + dy * dy);
							return dist <= range;
						}).map((s) => (
							<g key={s.id}>
								<circle
									cx={s.x}
									cy={s.y}
									r={s.status === "alert" ? 4 : 2}
									fill={s.status === "alert" ? "#dc2626" : "#22c55e"}
									className={s.status === "alert" ? "animate-pulse" : ""}
								>
									{s.status === "alert" && (
										<animate
											attributeName="r"
											values="3;5;3"
											dur="0.5s"
											repeatCount="indefinite"
										/>
									)}
								</circle>
							</g>
						))}

						<text
							x="100"
							y="10"
							textAnchor="middle"
							className="fill-sky-400"
							fontSize="7"
							fontFamily="monospace"
						>
							N
						</text>
						<text
							x="100"
							y="198"
							textAnchor="middle"
							className="fill-sky-400"
							fontSize="7"
							fontFamily="monospace"
						>
							S
						</text>
						<text
							x="5"
							y="103"
							className="fill-sky-400"
							fontSize="7"
							fontFamily="monospace"
						>
							W
						</text>
						<text
							x="190"
							y="103"
							className="fill-sky-400"
							fontSize="7"
							fontFamily="monospace"
						>
							E
						</text>
					</svg>
				</div>

				<div className="grid grid-cols-2 gap-2">
					<div>
						<p className="mb-1 font-mono text-[9px] uppercase tracking-widest text-zinc-500">
							Range: {range}km
						</p>
						<input
							type="range"
							min="20"
							max="100"
							value={range}
							onChange={(e) => setRange(Number(e.target.value))}
							className="h-1.5 w-full cursor-pointer appearance-none rounded-full accent-sky-500"
						/>
					</div>
					<div className="rounded-lg border border-red-500/20 bg-red-500/5 p-2 text-center">
						<p className="font-mono text-[8px] uppercase text-red-400/60">
							CO Alerts
						</p>
						<p className="font-mono text-lg font-black text-red-400">
							{alerts.length}
						</p>
					</div>
				</div>

				<div className="grid grid-cols-3 gap-1">
					{STATIONS.filter((s) => s.status === "alert")
						.slice(0, 3)
						.map((s) => (
							<div
								key={s.id}
								className="rounded border border-red-500/30 bg-red-500/10 p-2 text-center"
							>
								<p className="font-mono text-[10px] font-bold text-red-400">
									{s.name}
								</p>
								<p className="font-mono text-[8px] text-red-400/60">CO SPIKE</p>
							</div>
						))}
				</div>

				<div className="flex items-center justify-between rounded border border-white/5 bg-white/[0.02] px-3 py-2">
					<div className="flex items-center gap-1.5">
						<div className="h-2 w-2 animate-pulse rounded-full bg-emerald-400" />
						<span className="font-mono text-[10px] text-zinc-400">
							{STATIONS.length} Stations Active
						</span>
					</div>
					<span className="font-mono text-[9px] text-zinc-600">
						Auto-refresh: 30s
					</span>
				</div>
			</div>
		</Modal>
	);
}
