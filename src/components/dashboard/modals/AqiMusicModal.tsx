import { useEffect, useRef, useState } from "react";
import { Modal } from "#/components/ui/Modal";

const AQI_RANGES = [
	{
		range: "0-50",
		label: "Good",
		key: "C Major",
		mood: "Joyful",
		color: "#22c55e",
		instrument: "Piano",
	},
	{
		range: "51-100",
		label: "Moderate",
		key: "G Major",
		mood: "Calm",
		color: "#eab308",
		instrument: "Guitar",
	},
	{
		range: "101-150",
		label: "Sensitive",
		key: "F Minor",
		mood: "Tense",
		color: "#f97316",
		instrument: "Distorted Guitar",
	},
	{
		range: "151-200",
		label: "Unhealthy",
		key: "D Minor",
		mood: "Anxious",
		color: "#dc2626",
		instrument: "Distorted Guitar + Bass",
	},
	{
		range: "201+",
		label: "Hazardous",
		key: "Atonal",
		mood: "Panic",
		color: "#7c3aed",
		instrument: "Dissonant Mix",
	},
];

export function AqiMusicModal() {
	const [aqi, setAqi] = useState(144);
	const [playing, setPlaying] = useState(false);
	const canvasRef = useRef<HTMLCanvasElement>(null);
	const animRef = useRef<number>(0);

	const currentRange =
		AQI_RANGES.find((r) => {
			const [min, max] = r.range.split("-").map((s) => parseInt(s));
			return max !== undefined ? aqi >= min && aqi <= max : aqi <= max;
		}) || AQI_RANGES[AQI_RANGES.length - 1];

	useEffect(() => {
		if (!canvasRef.current || !playing) return;
		const canvas = canvasRef.current;
		const ctx = canvas.getContext("2d");
		if (!ctx) return;

		let phase = 0;
		const draw = () => {
			ctx.fillStyle = "rgba(0,0,0,0.3)";
			ctx.fillRect(0, 0, canvas.width, canvas.height);
			const bars = 32;
			for (let i = 0; i < bars; i++) {
				const x = (i / bars) * canvas.width;
				const h = Math.abs(
					Math.sin(phase + i * 0.3 + Math.random() * 0.1) * canvas.height * 0.6,
				);
				ctx.fillStyle = currentRange.color + "80";
				ctx.fillRect(x + 1, canvas.height - h, canvas.width / bars - 2, h);
			}
			phase += 0.08;
			animRef.current = requestAnimationFrame(draw);
		};
		animRef.current = requestAnimationFrame(draw);
		return () => cancelAnimationFrame(animRef.current);
	}, [playing, currentRange.color]);

	return (
		<Modal
			id="aqiMusic"
			title="AQI Music"
			icon={<span>🎵</span>}
			accentColor="#f472b6"
			size="lg"
		>
			<div className="space-y-4">
				<div className="flex items-center gap-3">
					<div className="flex-1">
						<p className="mb-1 font-mono text-[9px] uppercase tracking-widest text-zinc-500">
							AQI: {aqi}
						</p>
						<input
							type="range"
							min="20"
							max="250"
							value={aqi}
							onChange={(e) => setAqi(Number(e.target.value))}
							className="h-2 w-full cursor-pointer appearance-none rounded-full accent-pink-500"
						/>
					</div>
					<button
						type="button"
						onClick={() => setPlaying(!playing)}
						className={`flex h-12 w-12 items-center justify-center rounded-full text-xl transition-all ${
							playing
								? "bg-pink-500/20 text-pink-400 shadow-lg shadow-pink-500/30"
								: "bg-white/10 text-white hover:bg-white/20"
						}`}
					>
						{playing ? "⏸" : "▶"}
					</button>
				</div>

				<div className="rounded-xl border border-pink-500/20 bg-pink-500/5 p-4 text-center">
					<p className="font-mono text-[9px] uppercase tracking-widest text-pink-400/60">
						Current Composition
					</p>
					<p
						className="mt-1 font-mono text-2xl font-black"
						style={{ color: currentRange.color }}
					>
						{currentRange.key}
					</p>
					<p className="font-mono text-[10px] text-white">
						{currentRange.label} | {currentRange.mood}
					</p>
					<p className="mt-1 font-mono text-[9px] text-pink-400/60">
						{currentRange.instrument}
					</p>
				</div>

				<canvas
					ref={canvasRef}
					width={300}
					height={60}
					className="w-full rounded-lg border border-white/5"
				/>

				<div className="space-y-1">
					<p className="font-mono text-[9px] uppercase tracking-widest text-zinc-500">
						AQI → Key Mapping
					</p>
					<div className="grid grid-cols-5 gap-1">
						{AQI_RANGES.map((r) => (
							<button
								key={r.range}
								type="button"
								onClick={() => {
									const parts = r.range.split("-").map(Number);
									const mid =
										parts.length === 2
											? (parts[0] + parts[1]) / 2
											: parseInt(r.range);
									setAqi(Math.round(mid));
								}}
								className="flex flex-col items-center rounded-lg border p-2 text-center transition-colors"
								style={{
									borderColor: `${r.color}40`,
									backgroundColor:
										aqi >= parseInt(r.range.split("-")[0]) &&
										(!r.range.includes("-") ||
											aqi <= parseInt(r.range.split("-")[1]))
											? `${r.color}10`
											: "transparent",
								}}
							>
								<span
									className="font-mono text-[10px] font-black"
									style={{ color: r.color }}
								>
									{r.range}
								</span>
								<span className="font-mono text-[7px] text-zinc-500">
									{r.key.split(" ")[0]}
								</span>
								<span className="font-mono text-[7px] text-zinc-600">
									{r.mood}
								</span>
							</button>
						))}
					</div>
				</div>

				<div className="rounded-lg border border-white/5 bg-white/[0.03] p-3">
					<p className="font-mono text-[9px] uppercase tracking-widest text-zinc-500">
						Instrument Breakdown
					</p>
					<div className="mt-2 space-y-1.5">
						{[
							{ inst: "PM2.5", map: "Distorted Guitar", color: "#f97316" },
							{ inst: "CO", map: "Bass Drone", color: "#6366f1" },
							{ inst: "NOₓ", map: "Dissonant Piano", color: "#ec4899" },
							{ inst: "O₃", map: "High Strings", color: "#22c55e" },
						].map((item) => (
							<div
								key={item.inst}
								className="flex items-center gap-2 rounded border border-white/5 bg-white/[0.02] px-3 py-1.5"
							>
								<span className="font-mono text-[10px] font-bold text-white">
									{item.inst}
								</span>
								<span className="text-zinc-600">=</span>
								<span
									className="font-mono text-[10px] font-bold"
									style={{ color: item.color }}
								>
									{item.map}
								</span>
							</div>
						))}
					</div>
				</div>
			</div>
		</Modal>
	);
}
