import { useEffect, useState } from "react";
import { Modal } from "#/components/ui/Modal";

const AQI_LEVELS = [
	{ aqi: 50, label: "Good", color: "#22c55e", organs: ["Lungs"], severity: 0 },
	{
		aqi: 100,
		label: "Moderate",
		color: "#eab308",
		organs: ["Lungs", "Heart"],
		severity: 1,
	},
	{
		aqi: 144,
		label: "Unhealthy",
		color: "#f97316",
		organs: ["Lungs", "Heart", "Brain"],
		severity: 2,
	},
	{
		aqi: 200,
		label: "Very Unhealthy",
		color: "#dc2626",
		organs: ["Lungs", "Heart", "Brain", "Liver"],
		severity: 3,
	},
	{
		aqi: 300,
		label: "Hazardous",
		color: "#7c3aed",
		organs: ["Lungs", "Heart", "Brain", "Liver", "Kidneys"],
		severity: 4,
	},
];

export function BodyXRayModal() {
	const [aqi, setAqi] = useState(144);
	const [particles, setParticles] = useState(0);

	useEffect(() => {
		const interval = setInterval(() => {
			setParticles((p) => (p > 20 ? 0 : p + 1));
		}, 200);
		return () => clearInterval(interval);
	}, []);

	const level = AQI_LEVELS.reduce(
		(acc, l) => (aqi >= l.aqi ? l : acc),
		AQI_LEVELS[0],
	);

	return (
		<Modal
			id="bodyXRay"
			title="Body X-Ray"
			icon={<span>🫀</span>}
			accentColor="#ec4899"
			size="lg"
		>
			<div className="space-y-4">
				<div className="flex items-center gap-3">
					<div className="flex-1">
						<p className="mb-1 font-mono text-[9px] uppercase tracking-widest text-zinc-500">
							AQI Level
						</p>
						<input
							type="range"
							min="30"
							max="300"
							value={aqi}
							onChange={(e) => setAqi(Number(e.target.value))}
							className="h-2 w-full cursor-pointer appearance-none rounded-full accent-pink-500"
						/>
						<div className="mt-1 flex justify-between font-mono text-[8px] text-zinc-600">
							<span>30</span>
							<span>100</span>
							<span>200</span>
							<span>300</span>
						</div>
					</div>
					<div className="text-right">
						<p
							className="font-mono text-3xl font-black"
							style={{ color: level.color }}
						>
							{aqi}
						</p>
						<p className="font-mono text-[10px]" style={{ color: level.color }}>
							{level.label}
						</p>
					</div>
				</div>

				<div className="relative">
					<svg viewBox="0 0 200 280" className="w-full">
						<defs>
							<radialGradient id="bodyGrad" cx="50%" cy="50%" r="50%">
								<stop offset="0%" stopColor="#1f2937" />
								<stop offset="100%" stopColor="#111827" />
							</radialGradient>
							<filter id="organGlow">
								<feGaussianBlur stdDeviation="4" result="coloredBlur" />
								<feMerge>
									<feMergeNode in="coloredBlur" />
									<feMergeNode in="SourceGraphic" />
								</feMerge>
							</filter>
						</defs>

						<ellipse
							cx="100"
							cy="140"
							rx="60"
							ry="110"
							fill="url(#bodyGrad)"
							stroke="#374151"
							strokeWidth="1"
						/>

						<ellipse
							cx="100"
							cy="55"
							rx="35"
							ry="40"
							fill="#1f2937"
							stroke="#374151"
							strokeWidth="1"
						/>

						<ellipse
							cx="72"
							cy="62"
							rx="8"
							ry="8"
							fill="#1f2937"
							stroke="#374151"
							strokeWidth="1"
						/>
						<ellipse
							cx="128"
							cy="62"
							rx="8"
							ry="8"
							fill="#1f2937"
							stroke="#374151"
							strokeWidth="1"
						/>

						<ellipse
							cx="50"
							cy="130"
							rx="12"
							ry="30"
							fill="#1f2937"
							stroke="#374151"
							strokeWidth="1"
						/>
						<ellipse
							cx="150"
							cy="130"
							rx="12"
							ry="30"
							fill="#1f2937"
							stroke="#374151"
							strokeWidth="1"
						/>

						<ellipse
							cx="75"
							cy="145"
							rx="18"
							ry="22"
							fill="#1f2937"
							stroke="#374151"
							strokeWidth="1"
							className={level.severity >= 1 ? "animate-pulse" : ""}
						>
							{level.severity >= 1 && (
								<animate
									attributeName="stroke"
									values="#dc2626;#f87171;#dc2626"
									dur="1s"
									repeatCount="indefinite"
								/>
							)}
						</ellipse>
						<text
							x="75"
							y="148"
							textAnchor="middle"
							className="fill-red-400"
							fontSize="7"
							fontFamily="monospace"
							fontWeight="bold"
						>
							HEART
						</text>

						<ellipse
							cx="125"
							cy="145"
							rx="18"
							ry="22"
							fill="#1f2937"
							stroke="#374151"
							strokeWidth="1"
							className={level.severity >= 1 ? "animate-pulse" : ""}
						>
							{level.severity >= 1 && (
								<animate
									attributeName="stroke"
									values="#dc2626;#f87171;#dc2626"
									dur="1s"
									repeatCount="indefinite"
								/>
							)}
						</ellipse>
						<text
							x="125"
							y="148"
							textAnchor="middle"
							className="fill-red-400"
							fontSize="7"
							fontFamily="monospace"
							fontWeight="bold"
						>
							HEART
						</text>

						<ellipse
							cx="100"
							cy="180"
							rx="22"
							ry="28"
							fill="#1f2937"
							stroke={level.severity >= 2 ? "#dc2626" : "#374151"}
							strokeWidth="1.5"
							filter={level.severity >= 2 ? "url(#organGlow)" : undefined}
						>
							{level.severity >= 2 && (
								<animate
									attributeName="stroke-opacity"
									values="1;0.5;1"
									dur="1.5s"
									repeatCount="indefinite"
								/>
							)}
						</ellipse>
						<text
							x="100"
							y="183"
							textAnchor="middle"
							className="fill-zinc-400"
							fontSize="7"
							fontFamily="monospace"
						>
							LUNGS
						</text>

						<ellipse
							cx="88"
							cy="220"
							rx="12"
							ry="15"
							fill="#1f2937"
							stroke={level.severity >= 3 ? "#f97316" : "#374151"}
							strokeWidth="1"
						>
							{level.severity >= 3 && (
								<animate
									attributeName="stroke-opacity"
									values="1;0.5;1"
									dur="2s"
									repeatCount="indefinite"
								/>
							)}
						</ellipse>
						<ellipse
							cx="112"
							cy="220"
							rx="12"
							ry="15"
							fill="#1f2937"
							stroke={level.severity >= 3 ? "#f97316" : "#374151"}
							strokeWidth="1"
						/>

						<rect
							x="90"
							y="240"
							rx="5"
							width="20"
							height="15"
							fill="#1f2937"
							stroke={level.severity >= 4 ? "#eab308" : "#374151"}
							strokeWidth="1"
						/>

						<circle
							cx="100"
							cy="40"
							r="2"
							fill="#dc2626"
							filter="url(#organGlow)"
						/>
						<circle cx="100" cy="70" r="1.5" fill="#f97316" />
						<circle cx="100" cy="100" r="1.5" fill="#f97316" />
						<circle cx="100" cy="130" r="1.5" fill="#f97316" />

						{[...Array(particles)].map((_, i) => (
							<circle
								key={i}
								cx={85 + Math.sin(i * 0.8) * 20}
								cy={30 + i * 6}
								r={1}
								fill="#f97316"
								fillOpacity={0.8}
							>
								<animate
									attributeName="cy"
									from={30 + i * 6}
									to={30 + i * 6 - 20}
									dur="1s"
									fill="freeze"
								/>
							</circle>
						))}
					</svg>
				</div>

				<div className="space-y-1.5">
					<p className="font-mono text-[9px] uppercase tracking-widest text-zinc-500">
						Affected Organs
					</p>
					<div className="flex flex-wrap gap-1">
						{["Lungs", "Heart", "Brain", "Liver", "Kidneys"].map((organ) => {
							const affected = level.organs.includes(organ);
							return (
								<span
									key={organ}
									className={`rounded border px-2 py-0.5 font-mono text-[10px] font-bold ${
										affected
											? "border-red-500/40 bg-red-500/10 text-red-400"
											: "border-white/5 bg-white/[0.02] text-zinc-600"
									}`}
								>
									{affected ? "●" : "○"} {organ}
								</span>
							);
						})}
					</div>
				</div>

				<div className="space-y-1">
					<p className="font-mono text-[9px] uppercase tracking-widest text-zinc-500">
						Exposure → Damage Timeline
					</p>
					<div className="space-y-1">
						{[
							{ time: "15 min", damage: "None", color: "#22c55e" },
							{ time: "1 hour", damage: "Minor", color: "#eab308" },
							{ time: "4 hours", damage: "Moderate", color: "#f97316" },
							{ time: "8 hours", damage: "Severe", color: "#dc2626" },
						].map((item) => (
							<div
								key={item.time}
								className="flex items-center gap-2 rounded border border-white/5 bg-white/[0.02] px-3 py-1.5"
							>
								<span className="w-14 font-mono text-[10px] text-zinc-500">
									{item.time}
								</span>
								<div
									className="h-1 w-16 rounded-full"
									style={{ backgroundColor: item.color }}
								/>
								<span
									className="font-mono text-[10px] font-bold"
									style={{ color: item.color }}
								>
									{item.damage}
								</span>
							</div>
						))}
					</div>
				</div>
			</div>
		</Modal>
	);
}
