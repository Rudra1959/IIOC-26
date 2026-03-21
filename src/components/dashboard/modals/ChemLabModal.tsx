import { useState } from "react";
import { Modal } from "#/components/ui/Modal";

export function ChemLabModal() {
	const [so2, setSo2] = useState(50);
	const [nox, setNox] = useState(50);
	const [voc, setVoc] = useState(50);
	const [uv, setUv] = useState(50);
	const [humidity, setHumidity] = useState(60);

	const o3Rate = Math.round(
		so2 * 0.3 + nox * 0.4 + voc * 0.2 + uv * 0.15 + (humidity > 70 ? 15 : 0),
	);
	const pm25Out = Math.round(so2 * 0.5 + nox * 0.4 + humidity * 0.1);
	const acidRain =
		so2 * 0.6 + nox * 0.3 > 60
			? "HIGH RISK"
			: so2 * 0.6 + nox * 0.3 > 40
				? "MODERATE"
				: "LOW";

	return (
		<Modal
			id="chemLab"
			title="Chem Lab"
			icon={<span>🧪</span>}
			accentColor="#fb923c"
			size="lg"
		>
			<div className="space-y-4">
				<div className="relative">
					<svg viewBox="0 0 200 160" className="w-full">
						<defs>
							<radialGradient id="reactorGrad" cx="50%" cy="50%" r="50%">
								<stop offset="0%" stopColor="#f97316" stopOpacity="0.4" />
								<stop offset="100%" stopColor="#f97316" stopOpacity="0.05" />
							</radialGradient>
						</defs>

						<rect
							x="20"
							y="60"
							width="160"
							height="90"
							rx="8"
							fill="#1f2937"
							stroke="#374151"
							strokeWidth="1.5"
						/>
						<rect
							x="30"
							y="10"
							width="20"
							height="50"
							rx="4"
							fill="#1f2937"
							stroke="#374151"
							strokeWidth="1"
						/>
						<rect
							x="80"
							y="20"
							width="20"
							height="40"
							rx="4"
							fill="#1f2937"
							stroke="#374151"
							strokeWidth="1"
						/>
						<rect
							x="130"
							y="15"
							width="20"
							height="45"
							rx="4"
							fill="#1f2937"
							stroke="#374151"
							strokeWidth="1"
						/>

						<ellipse cx="100" cy="105" rx="70" ry="35" fill="url(#reactorGrad)">
							<animate
								attributeName="rx"
								values="70;73;70"
								dur="2s"
								repeatCount="indefinite"
							/>
							<animate
								attributeName="ry"
								values="35;38;35"
								dur="2s"
								repeatCount="indefinite"
							/>
						</ellipse>

						{[...Array(20)].map((_, i) => (
							<circle
								key={i}
								cx={30 + Math.random() * 140}
								cy={70 + Math.random() * 70}
								r={1 + Math.random() * 2}
								fill={
									o3Rate > 60 ? "#dc2626" : o3Rate > 40 ? "#eab308" : "#22c55e"
								}
								fillOpacity={0.3 + Math.random() * 0.5}
							>
								<animate
									attributeName="cy"
									values={`${70 + Math.random() * 70};${60};${70 + Math.random() * 70}`}
									dur={`${1 + Math.random()}s`}
									repeatCount="indefinite"
								/>
								<animate
									attributeName="opacity"
									values="0.3;0.8;0.3"
									dur={`${1 + Math.random()}s`}
									repeatCount="indefinite"
								/>
							</circle>
						))}
					</svg>
				</div>

				<div className="space-y-2">
					{[
						{ label: "SO₂", value: so2, set: setSo2, color: "#a78bfa" },
						{ label: "NOₓ", value: nox, set: setNox, color: "#38bdf8" },
						{ label: "VOC", value: voc, set: setVoc, color: "#22c55e" },
						{ label: "UV Index", value: uv, set: setUv, color: "#fbbf24" },
						{
							label: "Humidity",
							value: humidity,
							set: setHumidity,
							color: "#06b6d4",
						},
					].map((slider) => (
						<div key={slider.label}>
							<div className="mb-1 flex items-center justify-between">
								<span
									className="font-mono text-[10px] font-bold"
									style={{ color: slider.color }}
								>
									{slider.label}
								</span>
								<span className="font-mono text-[10px] font-bold text-white">
									{slider.value}ppb
								</span>
							</div>
							<input
								type="range"
								min="0"
								max="100"
								value={slider.value}
								onChange={(e) => slider.set(Number(e.target.value))}
								className="h-1.5 w-full cursor-pointer appearance-none rounded-full accent-pink-500"
								style={{
									background: `linear-gradient(to right, ${slider.color} ${slider.value}%, #27272a ${slider.value}%)`,
								}}
							/>
						</div>
					))}
				</div>

				<div className="grid grid-cols-3 gap-2">
					<div className="rounded-lg border border-orange-500/20 bg-orange-500/5 p-3 text-center">
						<p className="font-mono text-[8px] uppercase tracking-widest text-orange-400/60">
							O₃ Formation
						</p>
						<p className="font-mono text-xl font-black text-orange-400">
							{o3Rate}%
						</p>
						<div className="mt-1 h-1 w-full overflow-hidden rounded-full bg-white/5">
							<div
								className="h-full rounded-full"
								style={{
									width: `${o3Rate}%`,
									backgroundColor: o3Rate > 60 ? "#dc2626" : "#22c55e",
								}}
							/>
						</div>
					</div>
					<div className="rounded-lg border border-red-500/20 bg-red-500/5 p-3 text-center">
						<p className="font-mono text-[8px] uppercase tracking-widest text-red-400/60">
							PM2.5 Output
						</p>
						<p className="font-mono text-xl font-black text-red-400">
							{pm25Out}µg/m³
						</p>
						<div className="mt-1 h-1 w-full overflow-hidden rounded-full bg-white/5">
							<div
								className="h-full rounded-full"
								style={{
									width: `${Math.min(100, pm25Out)}%`,
									backgroundColor: pm25Out > 60 ? "#dc2626" : "#22c55e",
								}}
							/>
						</div>
					</div>
					<div className="rounded-lg border border-yellow-500/20 bg-yellow-500/5 p-3 text-center">
						<p className="font-mono text-[8px] uppercase tracking-widest text-yellow-400/60">
							Acid Rain
						</p>
						<p
							className="font-mono text-xl font-black"
							style={{
								color: acidRain === "HIGH RISK" ? "#dc2626" : "#eab308",
							}}
						>
							{acidRain}
						</p>
					</div>
				</div>
			</div>
		</Modal>
	);
}
