import { useState } from "react";
import { Modal } from "#/components/ui/Modal";

const LAYERS = [
	{
		id: "trueColor",
		label: "True Color",
		color: "#22c55e",
		desc: "Standard satellite imagery",
	},
	{
		id: "no2",
		label: "NO\u2082 Column",
		color: "#f59e0b",
		desc: "Nitrogen dioxide concentration",
	},
	{
		id: "pm25",
		label: "PM2.5 Surface",
		color: "#ef4444",
		desc: "Particulate matter density",
	},
	{
		id: "aod",
		label: "Aerosol Index",
		color: "#8b5cf6",
		desc: "UV absorbing aerosols",
	},
	{
		id: "co",
		label: "CO Column",
		color: "#ec4899",
		desc: "Carbon monoxide levels",
	},
	{
		id: "thermal",
		label: "Thermal",
		color: "#f97316",
		desc: "Surface temperature",
	},
];

export function SatelliteDecodeModal() {
	const [layer, setLayer] = useState("pm25");
	const [scanning, setScanning] = useState(false);
	const [scanLine, setScanLine] = useState(0);

	const currentLayer = LAYERS.find((l) => l.id === layer)!;

	const handleScan = () => {
		setScanning(true);
		setScanLine(0);
		const interval = setInterval(() => {
			setScanLine((prev) => {
				if (prev >= 100) {
					clearInterval(interval);
					setScanning(false);
					return 0;
				}
				return prev + 2;
			});
		}, 40);
	};

	return (
		<Modal
			id="satellite"
			title="Satellite Decode"
			icon={<span>🛰</span>}
			accentColor="#8b5cf6"
			size="lg"
		>
			<div className="space-y-4">
				<div className="grid grid-cols-3 gap-2">
					{LAYERS.map((l) => (
						<button
							key={l.id}
							type="button"
							onClick={() => setLayer(l.id)}
							className={`rounded-lg border p-2 text-left transition-all ${
								layer === l.id
									? "border-current bg-white/5"
									: "border-white/5 bg-white/[0.02] hover:border-white/10"
							}`}
							style={{
								borderColor: layer === l.id ? l.color : undefined,
								color: layer === l.id ? l.color : undefined,
							}}
						>
							<p className="font-mono text-[10px] font-bold">{l.label}</p>
							<p className="mt-0.5 font-mono text-[8px] text-zinc-500">
								{l.desc}
							</p>
						</button>
					))}
				</div>

				<div
					className="relative overflow-hidden rounded-xl border"
					style={{ borderColor: `${currentLayer.color}40`, background: "#000" }}
				>
					<svg viewBox="0 0 320 160" className="w-full">
						<defs>
							<linearGradient id="scanGrad" x1="0" x2="0" y1="0" y2="1">
								<stop
									offset="0%"
									stopColor={currentLayer.color}
									stopOpacity="0"
								/>
								<stop
									offset="45%"
									stopColor={currentLayer.color}
									stopOpacity="0.05"
								/>
								<stop
									offset="50%"
									stopColor={currentLayer.color}
									stopOpacity="0.4"
								/>
								<stop
									offset="55%"
									stopColor={currentLayer.color}
									stopOpacity="0.05"
								/>
								<stop
									offset="100%"
									stopColor={currentLayer.color}
									stopOpacity="0"
								/>
							</linearGradient>
							<clipPath id="scanClip">
								<rect x="0" y="0" width="320" height={`${scanLine * 1.6}px`} />
							</clipPath>
						</defs>
						<rect x="0" y="0" width="320" height="160" fill="#0a0a0a" />
						<rect
							x="0"
							y="0"
							width="320"
							height="160"
							fill={`url(#scanGrad)`}
						/>
						{Array.from({ length: 12 }).map((_, i) =>
							Array.from({ length: 6 }).map((_, j) => (
								<rect
									key={`${i}-${j}`}
									x={i * 27 + 2}
									y={j * 27 + 2}
									width={23}
									height={23}
									rx={2}
									fill={`${currentLayer.color}08`}
									stroke={`${currentLayer.color}15`}
									strokeWidth={0.5}
								/>
							)),
						)}
						{scanning && (
							<rect
								x="0"
								y={scanLine * 1.6}
								width="320"
								height={3}
								fill={currentLayer.color}
								opacity={0.8}
								clipPath="url(#scanClip)"
							/>
						)}
						<text
							x="10"
							y="20"
							fill={currentLayer.color}
							fontSize="8"
							fontFamily="monospace"
							opacity={0.6}
						>
							SENTINEL-5P {new Date().getFullYear()}
						</text>
						<text
							x="310"
							y="20"
							fill={currentLayer.color}
							fontSize="7"
							fontFamily="monospace"
							textAnchor="end"
							opacity={0.4}
						>
							{currentLayer.id.toUpperCase()}
						</text>
					</svg>
					<button
						type="button"
						onClick={handleScan}
						disabled={scanning}
						className="absolute bottom-2 right-2 rounded-lg border border-white/10 bg-black/60 px-2 py-1 font-mono text-[9px] text-white transition-colors hover:bg-black/80 disabled:opacity-50"
					>
						{scanning ? "SCANNING..." : "SCAN"}
					</button>
				</div>

				<div className="grid grid-cols-3 gap-2">
					{[
						{ label: "CO", value: "102.4 ppb", color: "#ec4899" },
						{ label: "NO\u2082", value: "45.2 ppb", color: "#f59e0b" },
						{ label: "O\u2083", value: "78.6 ppb", color: "#22c55e" },
					].map((s) => (
						<div
							key={s.label}
							className="rounded-lg border border-white/5 bg-white/[0.02] p-2 text-center"
						>
							<p className="font-mono text-[8px] uppercase text-zinc-500">
								{s.label}
							</p>
							<p
								className="font-mono text-[11px] font-bold"
								style={{ color: s.color }}
							>
								{s.value}
							</p>
						</div>
					))}
				</div>

				<div className="space-y-1.5">
					<p className="font-mono text-[9px] uppercase tracking-widest text-zinc-500">
						Plume Direction
					</p>
					<div className="flex items-center gap-2 rounded-lg border border-white/5 bg-white/[0.02] p-2">
						<svg width="40" height="40" viewBox="0 0 40 40">
							<circle cx="20" cy="20" r="3" fill="#8b5cf6" />
							{Array.from({ length: 8 }).map((_, i) => {
								const angle = (i * 45 + Date.now() / 50) * (Math.PI / 180);
								const r = 8 + Math.sin(Date.now() / 500 + i) * 2;
								return (
									<circle
										key={i}
										cx={20 + Math.cos(angle) * r}
										cy={20 + Math.sin(angle) * r}
										r={1}
										fill="#8b5cf6"
										opacity={0.4}
									/>
								);
							})}
						</svg>
						<div className="flex-1">
							<p className="font-mono text-[9px] text-white">
								Wind: NE 12 km/h
							</p>
							<p className="font-mono text-[8px] text-zinc-500">
								Plume extends 45km SE
							</p>
						</div>
						<span className="font-mono text-[9px] text-emerald-400">LOW</span>
					</div>
				</div>
			</div>
		</Modal>
	);
}
