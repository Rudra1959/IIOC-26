import { AnimatePresence, motion } from "framer-motion";
import { Camera, Eye, Wind, X } from "lucide-react";
import { useCallback, useEffect, useRef, useState } from "react";

interface Particle {
	x: number;
	y: number;
	vx: number;
	vy: number;
	size: number;
	opacity: number;
	color: string;
}

interface AROverlayProps {
	aqi?: number;
	pm25?: number;
	onClose?: () => void;
}

function getAQIColor(aqi: number): string {
	if (aqi <= 50) return "#22c55e";
	if (aqi <= 100) return "#eab308";
	if (aqi <= 150) return "#f97316";
	if (aqi <= 200) return "#dc2626";
	return "#7f1d1d";
}

export function AROverlay({ aqi = 85, pm25 = 45, onClose }: AROverlayProps) {
	const [isScanning, setIsScanning] = useState(false);
	const [permissionGranted, setPermissionGranted] = useState<boolean | null>(
		null,
	);
	const videoRef = useRef<HTMLVideoElement>(null);
	const canvasRef = useRef<HTMLCanvasElement>(null);
	const animationRef = useRef<number | null>(null);
	const particlesRef = useRef<Particle[]>([]);
	const [particles, setParticles] = useState<Particle[]>([]);

	const startCamera = useCallback(async () => {
		try {
			const stream = await navigator.mediaDevices.getUserMedia({
				video: { facingMode: "environment" },
			});
			if (videoRef.current) {
				videoRef.current.srcObject = stream;
				await videoRef.current.play();
				setPermissionGranted(true);
				setIsScanning(true);
			}
		} catch {
			setPermissionGranted(false);
		}
	}, []);

	const stopCamera = useCallback(() => {
		if (videoRef.current?.srcObject) {
			const stream = videoRef.current.srcObject as MediaStream;
			stream.getTracks().forEach((track) => {
				track.stop();
			});
			videoRef.current.srcObject = null;
		}
		setIsScanning(false);
		if (animationRef.current) {
			cancelAnimationFrame(animationRef.current);
		}
	}, []);

	const initParticles = useCallback(() => {
		const count = Math.min(150, Math.floor(pm25 * 2));
		const newParticles: Particle[] = [];
		const color = getAQIColor(aqi);

		for (let i = 0; i < count; i++) {
			newParticles.push({
				x: Math.random() * window.innerWidth,
				y: Math.random() * window.innerHeight,
				vx: (Math.random() - 0.5) * 2,
				vy: (Math.random() - 0.5) * 2,
				size: 2 + Math.random() * (pm25 / 10),
				opacity: 0.3 + Math.random() * 0.4,
				color,
			});
		}
		particlesRef.current = newParticles;
		setParticles(newParticles);
	}, [aqi, pm25]);

	const animate = useCallback(() => {
		const canvas = canvasRef.current;
		if (!canvas) return;

		const ctx = canvas.getContext("2d");
		if (!ctx) return;

		canvas.width = window.innerWidth;
		canvas.height = window.innerHeight;

		ctx.clearRect(0, 0, canvas.width, canvas.height);

		particlesRef.current.forEach((p) => {
			p.x += p.vx;
			p.y += p.vy;

			if (p.x < 0) p.x = canvas.width;
			if (p.x > canvas.width) p.x = 0;
			if (p.y < 0) p.y = canvas.height;
			if (p.y > canvas.height) p.y = 0;

			ctx.beginPath();
			ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2);
			ctx.fillStyle = p.color;
			ctx.globalAlpha = p.opacity;
			ctx.fill();
			ctx.globalAlpha = 1;
		});

		animationRef.current = requestAnimationFrame(animate);
	}, []);

	useEffect(() => {
		if (isScanning && particles.length > 0) {
			animate();
		}
		return () => {
			if (animationRef.current) {
				cancelAnimationFrame(animationRef.current);
			}
		};
	}, [isScanning, animate, particles.length]);

	useEffect(() => {
		if (isScanning) {
			initParticles();
		}
	}, [isScanning, initParticles]);

	useEffect(() => {
		return () => {
			stopCamera();
		};
	}, [stopCamera]);

	const color = getAQIColor(aqi);

	return (
		<AnimatePresence>
			{isScanning && (
				<motion.div
					initial={{ opacity: 0 }}
					animate={{ opacity: 1 }}
					exit={{ opacity: 0 }}
					className="fixed inset-0 z-[100] overflow-hidden"
				>
					<video
						ref={videoRef}
						className="absolute inset-0 h-full w-full object-cover"
						playsInline
						muted
					/>
					<canvas ref={canvasRef} className="absolute inset-0 h-full w-full" />

					<div
						className="absolute inset-0 pointer-events-none"
						style={{
							background: `radial-gradient(ellipse at center, transparent 0%, ${color}15 100%)`,
						}}
					/>

					<motion.div
						initial={{ opacity: 0, y: -20 }}
						animate={{ opacity: 1, y: 0 }}
						className="absolute top-0 left-0 right-0 bg-gradient-to-b from-black/80 to-transparent p-4 pt-8"
					>
						<div className="mx-auto w-max rounded-full border border-teal-500/30 bg-black/60 px-4 py-2 backdrop-blur-xl">
							<div className="flex items-center gap-3">
								<div className="flex items-center gap-2">
									<Eye className="h-4 w-4 text-teal-400" />
									<span className="font-mono text-[10px] font-bold uppercase tracking-widest text-teal-400">
										AR Scan
									</span>
								</div>
								<div className="h-4 w-px bg-white/20" />
								<div className="flex items-center gap-2">
									<Wind className="h-4 w-4" style={{ color }} />
									<span
										className="font-mono text-[14px] font-black"
										style={{ color }}
									>
										{aqi}
									</span>
									<span className="font-mono text-[10px] text-zinc-400">
										AQI
									</span>
								</div>
								<div className="h-4 w-px bg-white/20" />
								<span className="font-mono text-[9px] text-zinc-400">
									PM2.5: {pm25} μg/m³
								</span>
							</div>
						</div>
					</motion.div>

					<motion.button
						initial={{ opacity: 0, scale: 0.9 }}
						animate={{ opacity: 1, scale: 1 }}
						type="button"
						onClick={() => {
							stopCamera();
							onClose?.();
						}}
						className="absolute bottom-8 left-1/2 z-10 -translate-x-1/2 rounded-full border border-red-500/30 bg-black/60 px-6 py-3 backdrop-blur-xl transition-colors hover:bg-red-500/20"
					>
						<div className="flex items-center gap-2">
							<X className="h-4 w-4 text-red-400" />
							<span className="font-mono text-[10px] font-bold uppercase tracking-widest text-red-400">
								Stop Scanning
							</span>
						</div>
					</motion.button>

					<div className="pointer-events-none absolute inset-x-4 top-1/2 -translate-y-1/2 rounded-xl border border-teal-500/20" />
					<div className="pointer-events-none absolute inset-x-4 top-1/2 -translate-y-1/2 flex justify-between px-4">
						<div className="h-8 w-px bg-teal-500/50" />
						<div className="h-8 w-px bg-teal-500/50" />
					</div>
				</motion.div>
			)}

			{!isScanning && (
				<motion.div
					initial={{ opacity: 0, scale: 0.95 }}
					animate={{ opacity: 1, scale: 1 }}
					className="pointer-events-auto rounded-2xl border border-teal-500/20 bg-black/95 p-4 shadow-2xl backdrop-blur-2xl"
				>
					<div className="mb-3 flex items-center justify-between">
						<div className="flex items-center gap-2">
							<div className="flex h-8 w-8 items-center justify-center rounded-lg bg-teal-500/20">
								<Camera className="h-4 w-4 text-teal-400" />
							</div>
							<div>
								<h4 className="font-mono text-[11px] font-bold uppercase tracking-wider text-teal-400">
									Invisible Threat AR
								</h4>
								<p className="font-mono text-[9px] text-zinc-500">
									Scan environment with camera
								</p>
							</div>
						</div>
					</div>

					{permissionGranted === false && (
						<div className="mb-3 rounded border border-red-500/20 bg-red-500/10 p-2 font-mono text-[9px] text-red-400">
							Camera access denied. Please enable camera permissions.
						</div>
					)}

					<button
						type="button"
						onClick={startCamera}
						className="w-full rounded-lg bg-gradient-to-r from-teal-500 to-cyan-500 px-3 py-2 font-mono text-[11px] font-bold uppercase tracking-widest text-white shadow-lg shadow-teal-500/20 transition-all hover:from-teal-400 hover:to-cyan-400"
					>
						<div className="flex items-center justify-center gap-2">
							<Camera className="h-4 w-4" />
							Start AR Scan
						</div>
					</button>

					<div className="mt-2 space-y-1 rounded border border-white/5 bg-white/5 p-2">
						<p className="font-mono text-[8px] uppercase text-zinc-500">
							How it works
						</p>
						<p className="font-mono text-[8px] text-zinc-400">
							Particles overlay your camera view based on real PM2.5 data
						</p>
					</div>
				</motion.div>
			)}
		</AnimatePresence>
	);
}
