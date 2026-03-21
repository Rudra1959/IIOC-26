import { useEffect, useRef } from "react";
import type { AqiBand } from "#/lib/air-quality";
import { getAqiMeta } from "#/lib/air-quality";

interface ParticleGaugeProps {
	aqi: number | null;
	size?: number;
}

const BAND_COLORS: Record<AqiBand, string> = {
	good: "#22c55e",
	moderate: "#eab308",
	"unhealthy-sensitive": "#f97316",
	unhealthy: "#dc2626",
	"very-unhealthy": "#a21caf",
	hazardous: "#7f1d1d",
};

function getBandColor(aqi: number): string {
	const band = getAqiMeta(aqi).band;
	return BAND_COLORS[band];
}

interface Particle {
	x: number;
	y: number;
	vx: number;
	vy: number;
	life: number;
	maxLife: number;
	size: number;
	opacity: number;
}

export function ParticleGauge({ aqi, size = 100 }: ParticleGaugeProps) {
	const canvasRef = useRef<HTMLCanvasElement>(null);
	const particlesRef = useRef<Particle[]>([]);
	const animRef = useRef<number>(0);
	const lastAqiRef = useRef<number | null>(null);

	useEffect(() => {
		const canvas = canvasRef.current;
		if (!canvas) return;
		const ctx = canvas.getContext("2d");
		if (!ctx) return;

		const dpr = window.devicePixelRatio || 1;
		canvas.width = size * dpr;
		canvas.height = size * dpr;
		canvas.style.width = `${size}px`;
		canvas.style.height = `${size}px`;
		ctx.scale(dpr, dpr);

		const currentAqi = aqi ?? 50;
		const color = getBandColor(currentAqi);

		const maxParticles = Math.min(
			120,
			Math.max(15, Math.round(currentAqi * 0.6)),
		);
		const spawnRate = currentAqi > 100 ? 3 : currentAqi > 50 ? 2 : 1;

		const cx = size / 2;
		const cy = size / 2;
		const maxRadius = (size / 2) * 0.78;

		const spawnParticle = (): Particle => {
			const angle = Math.random() * Math.PI * 2;
			const r = Math.random() * maxRadius * 0.9;
			const life = 40 + Math.random() * 60;
			return {
				x: cx + Math.cos(angle) * r,
				y: cy + Math.sin(angle) * r,
				vx: (Math.random() - 0.5) * 0.8,
				vy: -(0.3 + Math.random() * 0.8),
				life,
				maxLife: life,
				size: 0.8 + Math.random() * 2.2,
				opacity: 0.3 + Math.random() * 0.7,
			};
		};

		if (lastAqiRef.current !== currentAqi) {
			particlesRef.current = [];
			lastAqiRef.current = currentAqi;
		}

		const draw = () => {
			ctx.clearRect(0, 0, size, size);

			const ringR = maxRadius + 4;
			const ringWidth = 2.5;

			const grad = ctx.createRadialGradient(
				cx,
				cy,
				ringR - ringWidth,
				cx,
				cy,
				ringR + ringWidth,
			);
			grad.addColorStop(0, color + "60");
			grad.addColorStop(0.5, color + "cc");
			grad.addColorStop(1, color + "30");

			ctx.beginPath();
			ctx.arc(cx, cy, ringR, 0, Math.PI * 2);
			ctx.strokeStyle = grad;
			ctx.lineWidth = ringWidth * 2;
			ctx.stroke();

			const innerGlow = ctx.createRadialGradient(
				cx,
				cy,
				maxRadius * 0.3,
				cx,
				cy,
				maxRadius,
			);
			innerGlow.addColorStop(0, color + "15");
			innerGlow.addColorStop(0.7, color + "05");
			innerGlow.addColorStop(1, color + "00");
			ctx.beginPath();
			ctx.arc(cx, cy, maxRadius, 0, Math.PI * 2);
			ctx.fillStyle = innerGlow;
			ctx.fill();

			const tickCount = 36;
			for (let i = 0; i < tickCount; i++) {
				const angle = (i / tickCount) * Math.PI * 2 - Math.PI / 2;
				const pct = i / tickCount;
				const isMajor = i % 9 === 0;
				const inner = maxRadius * (isMajor ? 0.88 : 0.92);
				const outer = maxRadius * 0.97;
				ctx.beginPath();
				ctx.moveTo(cx + Math.cos(angle) * inner, cy + Math.sin(angle) * inner);
				ctx.lineTo(cx + Math.cos(angle) * outer, cy + Math.sin(angle) * outer);
				ctx.strokeStyle = pct <= currentAqi / 500 ? color + "aa" : color + "22";
				ctx.lineWidth = isMajor ? 1.5 : 0.5;
				ctx.stroke();
			}

			const fillAngle = (currentAqi / 500) * Math.PI * 2 - Math.PI / 2;
			if (currentAqi > 0) {
				const arcGrad = ctx.createLinearGradient(
					cx + Math.cos(fillAngle) * maxRadius,
					cy + Math.sin(fillAngle) * maxRadius,
					cx - maxRadius,
					cy,
				);
				arcGrad.addColorStop(0, color);
				arcGrad.addColorStop(1, color + "aa");

				ctx.beginPath();
				ctx.arc(cx, cy, maxRadius, -Math.PI / 2, fillAngle);
				ctx.strokeStyle = arcGrad;
				ctx.lineWidth = 3;
				ctx.lineCap = "round";
				ctx.stroke();

				ctx.beginPath();
				ctx.arc(
					cx + Math.cos(fillAngle) * maxRadius,
					cy + Math.sin(fillAngle) * maxRadius,
					4,
					0,
					Math.PI * 2,
				);
				ctx.fillStyle = color;
				ctx.shadowColor = color;
				ctx.shadowBlur = 8;
				ctx.fill();
				ctx.shadowBlur = 0;
			}

			if (
				Math.random() < spawnRate * 0.3 &&
				particlesRef.current.length < maxParticles
			) {
				particlesRef.current.push(spawnParticle());
			}

			particlesRef.current = particlesRef.current.filter((p) => p.life > 0);

			for (const p of particlesRef.current) {
				p.x += p.vx;
				p.y += p.vy;
				p.life -= 1;
				p.vy -= 0.02;

				const dx = p.x - cx;
				const dy = p.y - cy;
				const dist = Math.sqrt(dx * dx + dy * dy);
				if (dist > maxRadius * 0.95) {
					p.life = 0;
				}

				const lifeRatio = p.life / p.maxLife;
				const alpha =
					Math.min(1, lifeRatio * p.opacity) * (1 - (1 - lifeRatio) * 0.5);

				ctx.beginPath();
				ctx.arc(p.x, p.y, p.size * lifeRatio, 0, Math.PI * 2);
				ctx.fillStyle =
					color +
					Math.round(alpha * 255)
						.toString(16)
						.padStart(2, "0");
				ctx.shadowColor = color;
				ctx.shadowBlur = 4;
				ctx.fill();
				ctx.shadowBlur = 0;
			}

			ctx.font = `bold ${size * 0.22}px "JetBrains Mono", monospace`;
			ctx.textAlign = "center";
			ctx.textBaseline = "middle";
			ctx.fillStyle = color;
			ctx.shadowColor = color;
			ctx.shadowBlur = 12;
			ctx.fillText(String(currentAqi), cx, cy + size * 0.02);
			ctx.shadowBlur = 0;

			ctx.font = `bold ${size * 0.08}px monospace`;
			ctx.fillStyle = "#ffffff80";
			ctx.fillText("AQI", cx, cy + size * 0.18);

			animRef.current = requestAnimationFrame(draw);
		};

		animRef.current = requestAnimationFrame(draw);
		return () => cancelAnimationFrame(animRef.current);
	}, [aqi, size]);

	const band = aqi ? getAqiMeta(aqi).band : "moderate";
	const label = aqi ? getAqiMeta(aqi).label : "Loading";
	const color = aqi ? getBandColor(aqi) : "#6b7280";

	return (
		<div className="flex flex-col items-center gap-1">
			<canvas ref={canvasRef} className="rounded-full" />
			<span
				className="font-mono text-[9px] font-bold uppercase tracking-widest"
				style={{ color }}
			>
				{label}
			</span>
		</div>
	);
}
