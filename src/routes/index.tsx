import { SignInButton, SignUpButton, useUser } from "@clerk/clerk-react";
import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { motion } from "framer-motion";
import {
	ArrowRight,
	Brain,
	Globe2,
	Leaf,
	MapPin,
	Shield,
	Sparkles,
	Wind,
	Zap,
	Activity,
	BarChart3,
	Eye,
} from "lucide-react";
import { useEffect, useRef, useState } from "react";

export const Route = createFileRoute("/")(
	{
		component: LandingPage,
	},
);

/* ──────── Interactive Globe ──────── */
function Globe() {
	const canvasRef = useRef<HTMLCanvasElement>(null);
	const pointerInteracting = useRef<number | null>(null);
	const phiRef = useRef(0);

	useEffect(() => {
		let width = 0;
		const onResize = () => {
			if (canvasRef.current) {
				width = canvasRef.current.offsetWidth;
			}
		};
		window.addEventListener("resize", onResize);
		onResize();

		if (!canvasRef.current) return;

		let globe: { destroy: () => void } | null = null;
		let idleCallbackId: number | null = null;
		let timeoutId: ReturnType<typeof globalThis.setTimeout> | null = null;
		const browserWindow = window as Window &
			typeof globalThis & {
				requestIdleCallback?: (
					callback: () => void,
					options?: { timeout: number },
				) => number;
				cancelIdleCallback?: (handle: number) => void;
			};

		const renderGlobe = () => {
			void import("cobe").then(({ default: createGlobe }) => {
				if (!canvasRef.current) {
					return;
				}

				globe = createGlobe(canvasRef.current, {
					devicePixelRatio: Math.min(window.devicePixelRatio, 2),
					width: width * 2,
					height: width * 2,
					phi: 0,
					theta: 0.3,
					dark: 1,
					diffuse: 1.4,
					mapSamples: width > 768 ? 16000 : 10000,
					mapBrightness: 8,
					baseColor: [0.02, 0.08, 0.04],
					markerColor: [0.1, 0.85, 0.5],
					glowColor: [0.03, 0.25, 0.12],
					markers: [
						{ location: [28.6139, 77.209], size: 0.1 },
						{ location: [37.7595, -122.4367], size: 0.08 },
						{ location: [40.7128, -74.006], size: 0.07 },
						{ location: [51.5072, -0.1276], size: 0.06 },
						{ location: [35.6762, 139.6503], size: 0.09 },
						{ location: [1.3521, 103.8198], size: 0.06 },
						{ location: [-33.8688, 151.2093], size: 0.05 },
						{ location: [55.7558, 37.6173], size: 0.07 },
					],
					onRender: (state) => {
						if (pointerInteracting.current === null) {
							phiRef.current += 0.004;
						}
						state.phi = phiRef.current;
						state.width = width * 2;
						state.height = width * 2;
					},
				});
			});
		};

		if (browserWindow.requestIdleCallback) {
			idleCallbackId = browserWindow.requestIdleCallback(renderGlobe, {
				timeout: 600,
			});
		} else {
			timeoutId = globalThis.setTimeout(renderGlobe, 120);
		}

		return () => {
			if (idleCallbackId !== null && browserWindow.cancelIdleCallback) {
				browserWindow.cancelIdleCallback(idleCallbackId);
			}

			if (timeoutId !== null) {
				globalThis.clearTimeout(timeoutId);
			}

			globe?.destroy();
			window.removeEventListener("resize", onResize);
		};
	}, []);

	return (
		<div
			style={{
				width: "100%",
				maxWidth: 800,
				aspectRatio: 1,
				margin: "auto",
				position: "relative",
			}}
		>
			<canvas
				ref={canvasRef}
				onPointerDown={(e) => {
					pointerInteracting.current = e.clientX;
					if (canvasRef.current) {
						canvasRef.current.style.cursor = "grabbing";
					}
				}}
				onPointerUp={() => {
					pointerInteracting.current = null;
					if (canvasRef.current) {
						canvasRef.current.style.cursor = "grab";
					}
				}}
				onPointerOut={() => {
					pointerInteracting.current = null;
					if (canvasRef.current) {
						canvasRef.current.style.cursor = "grab";
					}
				}}
				onMouseMove={(e) => {
					if (pointerInteracting.current !== null) {
						const delta = e.clientX - pointerInteracting.current;
						phiRef.current += delta / 200;
						pointerInteracting.current = e.clientX;
					}
				}}
				onTouchMove={(e) => {
					if (pointerInteracting.current !== null && e.touches[0]) {
						const delta = e.touches[0].clientX - pointerInteracting.current;
						phiRef.current += delta / 200;
						pointerInteracting.current = e.touches[0].clientX;
					}
				}}
				style={{
					width: "100%",
					height: "100%",
					contain: "layout paint size",
					opacity: 1,
					transition: "opacity 1s ease",
					cursor: "grab",
				}}
			/>
		</div>
	);
}

/* ──────── Animated Counter ──────── */
function AnimatedCounter({ target, suffix = "" }: { target: number; suffix?: string }) {
	const [count, setCount] = useState(0);
	const ref = useRef<HTMLDivElement>(null);

	useEffect(() => {
		const el = ref.current;
		if (!el) return;
		const observer = new IntersectionObserver(
			([entry]) => {
				if (entry?.isIntersecting) {
					let start = 0;
					const duration = 2000;
					const startTime = performance.now();
					const animate = (time: number) => {
						const elapsed = time - startTime;
						const progress = Math.min(elapsed / duration, 1);
						const eased = 1 - (1 - progress) ** 3;
						start = Math.floor(eased * target);
						setCount(start);
						if (progress < 1) requestAnimationFrame(animate);
					};
					requestAnimationFrame(animate);
					observer.disconnect();
				}
			},
			{ threshold: 0.3 },
		);
		observer.observe(el);
		return () => observer.disconnect();
	}, [target]);

	return (
		<div ref={ref} className="text-4xl sm:text-5xl font-black tabular-nums">
			{count.toLocaleString()}
			{suffix}
		</div>
	);
}

/* ──────── Feature Data ──────── */
const features = [
	{
		icon: Activity,
		title: "Real-Time Processing",
		description:
			"Live AQI data from 500m hexagonal cells aggregated and visualized in real-time on the 3D map.",
		gradient: "from-emerald-500 to-teal-600",
	},
	{
		icon: Brain,
		title: "Decision Intelligence",
		description:
			"AI-powered source attribution identifies exactly what is causing poor air quality in each zone.",
		gradient: "from-purple-500 to-pink-600",
	},
	{
		icon: BarChart3,
		title: "Growth Archive",
		description:
			"Historical trend data tracks how pollution levels evolve over hours, days, and months.",
		gradient: "from-cyan-500 to-blue-600",
	},
	{
		icon: Shield,
		title: "Automated Alerts",
		description:
			"Push notifications when environmental risk scores breach safety limits for your zone.",
		gradient: "from-orange-500 to-red-600",
	},
	{
		icon: Wind,
		title: "Wind Corridors",
		description:
			"Identify natural ventilation paths and monitor how pollutants disperse through urban canyons.",
		gradient: "from-sky-500 to-indigo-600",
	},
	{
		icon: Eye,
		title: "Source Detection",
		description:
			"Combine wind data, traffic patterns, and land use to pinpoint probable pollution sources.",
		gradient: "from-amber-500 to-orange-600",
	},
];

const stats = [
	{ value: 2400, suffix: "+", label: "Cities Monitored" },
	{ value: 14, suffix: "M+", label: "Data Points Daily" },
	{ value: 500, suffix: "m", label: "Grid Resolution" },
	{ value: 99.7, suffix: "%", label: "Uptime SLA" },
];

const tagPills = [
	{ icon: MapPin, label: "AQI Monitor" },
	{ icon: Globe2, label: "3D Visualization" },
	{ icon: Zap, label: "Heat Islands" },
	{ icon: Leaf, label: "Clean Zones" },
];

/* ──────── Main Landing Page ──────── */
function LandingPage() {
	const { isSignedIn } = useUser();
	const navigate = useNavigate();

	useEffect(() => {
		if (isSignedIn) {
			navigate({ to: "/dashboard" });
		}
	}, [isSignedIn, navigate]);

	return (
		<div className="min-h-screen bg-[#040806] text-white overflow-hidden">
			{/* ── Ambient Background ── */}
			<div className="pointer-events-none fixed inset-0 z-0">
				<div className="absolute inset-0 bg-[radial-gradient(ellipse_at_20%_0%,rgba(16,185,129,0.18),transparent_50%)]" />
				<div className="absolute inset-0 bg-[radial-gradient(ellipse_at_80%_20%,rgba(6,78,59,0.25),transparent_50%)]" />
				<div className="absolute bottom-0 left-0 right-0 h-1/2 bg-gradient-to-t from-[#040806] to-transparent" />
			</div>

			{/* ── Nav ── */}
			<nav className="fixed top-0 w-full z-50 border-b border-white/[0.06]">
				<div className="absolute inset-0 bg-[#040806]/60 backdrop-blur-2xl" />
				<div className="relative max-w-7xl mx-auto px-6 py-4 flex items-center justify-between">
					<div className="flex items-center gap-3">
						<div className="relative">
							<div className="w-2.5 h-2.5 rounded-full bg-emerald-400" />
							<div className="absolute inset-0 w-2.5 h-2.5 rounded-full bg-emerald-400 animate-ping opacity-75" />
						</div>
						<span className="text-lg font-bold tracking-tight font-display">
							AirSentinel
						</span>
						<span className="text-[9px] tracking-[0.3em] text-emerald-400/70 uppercase font-bold">
							OS
						</span>
					</div>

					<div className="hidden md:flex items-center gap-1">
						{["Platform", "Features", "Research"].map((item) => (
							<button
								key={item}
								type="button"
								className="px-4 py-2 text-sm text-zinc-400 hover:text-white transition-colors rounded-lg hover:bg-white/5"
							>
								{item}
							</button>
						))}
					</div>

					<div className="flex items-center gap-3">
						<SignInButton mode="modal">
							<button
								type="button"
								className="px-4 py-2 text-sm text-zinc-400 hover:text-white transition-colors cursor-pointer"
							>
								Sign In
							</button>
						</SignInButton>
						<SignUpButton mode="modal">
							<button
								type="button"
								className="px-5 py-2.5 text-sm font-semibold bg-emerald-500 text-black rounded-xl hover:bg-emerald-400 transition-all cursor-pointer shadow-[0_0_20px_rgba(16,185,129,0.3)]"
							>
								Get Started
							</button>
						</SignUpButton>
					</div>
				</div>
			</nav>

			{/* ── Hero ── */}
			<section className="relative min-h-screen flex items-center pt-24 pb-20 px-6">
				<div className="max-w-7xl mx-auto w-full grid grid-cols-1 lg:grid-cols-2 gap-12 items-center relative z-10">
					{/* Left: Text */}
					<motion.div
						initial={{ opacity: 0, x: -40 }}
						animate={{ opacity: 1, x: 0 }}
						transition={{ duration: 1, ease: [0.16, 1, 0.3, 1] }}
					>
						<div className="inline-flex items-center gap-2 px-4 py-2 rounded-full border border-emerald-500/20 bg-emerald-500/5 mb-8">
							<Sparkles className="w-3.5 h-3.5 text-emerald-400" />
							<span className="text-xs font-semibold tracking-wide text-emerald-300 uppercase">
								Environmental AI Platform
							</span>
						</div>

						<h1 className="text-5xl sm:text-6xl lg:text-7xl font-black tracking-tight leading-[1.05] mb-8">
							<span className="text-white/90">Innovating the</span>
							<br />
							<span className="text-white/90">spirit of </span>
							<span className="bg-gradient-to-r from-emerald-400 via-green-300 to-teal-400 bg-clip-text text-transparent">
								AirSentinel
							</span>
							<br />
							<span className="bg-gradient-to-r from-emerald-400 to-cyan-400 bg-clip-text text-transparent">
								AI
							</span>
						</h1>

						<p className="text-lg text-zinc-400 max-w-lg mb-10 leading-relaxed">
							A 3D digital twin that maps pollution, heat islands, and air
							quality at{" "}
							<span className="text-emerald-300 font-semibold">
								500-meter resolution
							</span>
							. Build for city-scale environmental intelligence.
						</p>

						<div className="flex flex-wrap gap-3 mb-10">
							<SignUpButton mode="modal">
								<button
									type="button"
									className="group relative px-8 py-4 bg-gradient-to-r from-emerald-500 to-teal-500 text-black font-bold rounded-2xl transition-all duration-300 hover:scale-105 active:scale-95 overflow-hidden shadow-[0_0_40px_rgba(16,185,129,0.25)] hover:shadow-[0_0_60px_rgba(16,185,129,0.4)] flex items-center gap-2 cursor-pointer"
								>
									<div className="absolute inset-0 bg-white/20 translate-y-full group-hover:translate-y-0 transition-transform duration-300 ease-out" />
									<span className="relative z-10 flex items-center gap-2">
										Explore Now
										<ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
									</span>
								</button>
							</SignUpButton>
							<a
								href="https://github.com/Rudra1959/IIOC-26"
								target="_blank"
								rel="noreferrer"
								className="px-8 py-4 border border-white/10 text-zinc-300 font-semibold rounded-2xl hover:bg-white/5 hover:border-white/20 transition-all backdrop-blur-sm cursor-pointer"
							>
								View on GitHub
							</a>
						</div>

						{/* Tag Pills */}
						<div className="flex flex-wrap gap-2">
							{tagPills.map((pill) => (
								<div
									key={pill.label}
									className="flex items-center gap-2 px-4 py-2 rounded-full border border-white/10 bg-white/[0.03] text-xs text-zinc-400 font-medium hover:border-emerald-500/30 hover:text-emerald-300 transition-colors cursor-default"
								>
									<pill.icon className="w-3.5 h-3.5" />
									{pill.label}
								</div>
							))}
						</div>
					</motion.div>

					{/* Right: Globe */}
					<motion.div
						initial={{ opacity: 0, scale: 0.9 }}
						animate={{ opacity: 1, scale: 1 }}
						transition={{ duration: 1.2, delay: 0.2, ease: [0.16, 1, 0.3, 1] }}
						className="relative"
					>
						<div className="absolute inset-0 blur-3xl bg-emerald-500/10 rounded-full scale-75" />
						<Globe />
					</motion.div>
				</div>

				{/* Visionary Quote */}
				<motion.div
					initial={{ opacity: 0 }}
					animate={{ opacity: 1 }}
					transition={{ delay: 1.5, duration: 1 }}
					className="absolute bottom-8 left-6 right-6 z-10"
				>
					<div className="max-w-7xl mx-auto flex items-center gap-6">
						<div className="hidden sm:block h-px flex-1 bg-gradient-to-r from-transparent via-emerald-500/30 to-transparent" />
						<div className="text-center">
							<p className="text-[10px] tracking-[0.3em] text-zinc-600 uppercase mb-2">
								Visionary Design
							</p>
							<p className="text-sm text-zinc-500 italic">
								&ldquo;We imagined a realm with no pollution.&rdquo;
							</p>
						</div>
						<div className="hidden sm:block h-px flex-1 bg-gradient-to-r from-transparent via-emerald-500/30 to-transparent" />
					</div>
				</motion.div>
			</section>

			{/* ── Stats ── */}
			<section className="relative z-10 py-20 px-6 border-y border-white/[0.04]">
				<div className="max-w-6xl mx-auto grid grid-cols-2 md:grid-cols-4 gap-8">
					{stats.map((stat) => (
						<motion.div
							key={stat.label}
							initial={{ opacity: 0, y: 30 }}
							whileInView={{ opacity: 1, y: 0 }}
							viewport={{ once: true }}
							transition={{ duration: 0.6 }}
							className="text-center"
						>
							<div className="text-emerald-400">
								<AnimatedCounter target={stat.value} suffix={stat.suffix} />
							</div>
							<p className="text-xs text-zinc-500 mt-2 uppercase tracking-[0.15em] font-medium">
								{stat.label}
							</p>
						</motion.div>
					))}
				</div>
			</section>

			{/* ── Features ── */}
			<section className="py-32 px-6 relative z-10">
				<div className="max-w-6xl mx-auto">
					<motion.div
						initial={{ opacity: 0, y: 40 }}
						whileInView={{ opacity: 1, y: 0 }}
						viewport={{ once: true, margin: "-100px" }}
						transition={{ duration: 0.8, ease: "easeOut" }}
						className="text-center mb-20"
					>
						<p className="text-[10px] tracking-[0.35em] text-emerald-400/60 uppercase mb-4 font-bold">
							Platform Capabilities
						</p>
						<h2 className="text-4xl sm:text-5xl font-black mb-6 tracking-tight text-white">
							Built for City-Scale Intelligence
						</h2>
						<p className="text-lg text-zinc-500 max-w-2xl mx-auto">
							Every feature is engineered for real-time environmental
							decision-making at unprecedented resolution.
						</p>
					</motion.div>

					<div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
						{features.map((feature, i) => (
							<motion.div
								key={feature.title}
								initial={{ opacity: 0, y: 30 }}
								whileInView={{ opacity: 1, y: 0 }}
								viewport={{ once: true, margin: "-50px" }}
								transition={{
									delay: i * 0.1,
									duration: 0.6,
									ease: "easeOut",
								}}
								whileHover={{ y: -4 }}
								className="group relative p-7 rounded-2xl border border-white/[0.06] bg-white/[0.02] backdrop-blur-sm overflow-hidden transition-all duration-500 hover:border-white/[0.12] hover:bg-white/[0.04] cursor-pointer"
							>
								<div className="absolute inset-0 bg-gradient-to-br from-white/[0.03] to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none" />

								<div
									className={`w-12 h-12 rounded-xl bg-gradient-to-br ${feature.gradient} flex items-center justify-center mb-5 shadow-lg group-hover:shadow-xl group-hover:scale-110 transition-all duration-500`}
								>
									<feature.icon className="w-6 h-6 text-white" />
								</div>
								<h3 className="text-lg font-bold mb-2 tracking-tight text-white">
									{feature.title}
								</h3>
								<p className="text-sm text-zinc-500 leading-relaxed">
									{feature.description}
								</p>

								<div
									className={`absolute bottom-0 left-0 h-0.5 w-0 bg-gradient-to-r ${feature.gradient} group-hover:w-full transition-all duration-700 ease-out`}
								/>
							</motion.div>
						))}
					</div>
				</div>
			</section>

			{/* ── Ecosystem CTA ── */}
			<section className="py-32 px-6 relative z-10">
				<div className="max-w-4xl mx-auto text-center">
					<motion.div
						initial={{ opacity: 0, scale: 0.95, y: 40 }}
						whileInView={{ opacity: 1, scale: 1, y: 0 }}
						viewport={{ once: true }}
						transition={{ duration: 0.8, ease: "backOut" }}
						className="relative p-12 sm:p-16 rounded-[2rem] border border-emerald-500/10 bg-gradient-to-br from-emerald-500/[0.04] to-transparent backdrop-blur-2xl overflow-hidden group"
					>
						<div className="absolute inset-0 bg-gradient-to-r from-emerald-500/[0.06] to-teal-500/[0.06] opacity-0 group-hover:opacity-100 transition-opacity duration-700 pointer-events-none" />

						<p className="text-[10px] tracking-[0.35em] text-emerald-400/50 uppercase mb-6 font-bold relative z-10">
							Enter Our Ecosystem
						</p>
						<h2 className="text-4xl sm:text-5xl lg:text-6xl font-black mb-6 tracking-tight text-white relative z-10">
							Ready to monitor
							<br />
							your city?
						</h2>
						<p className="text-lg text-zinc-500 mb-10 max-w-xl mx-auto relative z-10">
							Join the platform governments and citizens trust for real-time air
							quality intelligence powered by AI.
						</p>
						<div className="relative z-10 flex flex-col sm:flex-row justify-center gap-4">
							<SignUpButton mode="modal">
								<button
									type="button"
									className="px-10 py-5 bg-white text-black font-bold text-lg rounded-2xl hover:scale-105 active:scale-95 transition-transform duration-300 shadow-[0_0_40px_rgba(255,255,255,0.15)] hover:shadow-[0_0_60px_rgba(255,255,255,0.25)] cursor-pointer"
								>
									Create Free Account
								</button>
							</SignUpButton>
							<a
								href="https://docs.google.com/forms/d/e/1FAIpQLSd-j_YxYdrzWmjl2txqp57RfBEL7r7JRQFyZd1mOTv26taPzg/viewform"
								target="_blank"
								rel="noreferrer"
								className="px-10 py-5 border border-white/10 text-zinc-300 font-bold text-lg rounded-2xl hover:bg-white/5 hover:border-white/20 transition-all cursor-pointer text-center"
							>
								Join Waitlist
							</a>
						</div>
					</motion.div>
				</div>
			</section>

			{/* ── Footer ── */}
			<footer className="border-t border-white/[0.04] py-10 px-6 relative z-10">
				<div className="max-w-7xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-4">
					<div className="flex items-center gap-3">
						<div className="w-2 h-2 rounded-full bg-emerald-400" />
						<span className="text-sm text-zinc-600 font-display font-bold">
							AirSentinel OS
						</span>
					</div>
					<p className="text-xs text-zinc-700">
						{"\u00A9"} 2026 Environmental Intelligence Platform. All rights
						reserved.
					</p>
					<div className="flex items-center gap-4">
						<a
							href="https://github.com/Rudra1959/IIOC-26"
							target="_blank"
							rel="noreferrer"
							className="text-xs text-zinc-600 hover:text-zinc-400 transition-colors"
						>
							GitHub
						</a>
						<a
							href="#"
							className="text-xs text-zinc-600 hover:text-zinc-400 transition-colors"
						>
							Docs
						</a>
						<a
							href="#"
							className="text-xs text-zinc-600 hover:text-zinc-400 transition-colors"
						>
							Privacy
						</a>
					</div>
				</div>
			</footer>
		</div>
	);
}
