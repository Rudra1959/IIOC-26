import { SignInButton, SignUpButton, useUser } from "@clerk/clerk-react";
import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { motion } from "framer-motion";
import { ArrowRight, Brain, MapPin, Shield, Zap } from "lucide-react";
import { useEffect, useRef } from "react";
export const Route = createFileRoute("/")({
	component: LandingPage,
});

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
					diffuse: 1.2,
					mapSamples: width > 768 ? 10000 : 7000,
					mapBrightness: 6,
					baseColor: [0.05, 0.05, 0.05],
					markerColor: [0.1, 0.8, 0.5],
					glowColor: [0.05, 0.2, 0.1],
					markers: [
						{ location: [37.7595, -122.4367], size: 0.08 },
						{ location: [40.7128, -74.006], size: 0.07 },
						{ location: [51.5072, -0.1276], size: 0.06 },
						{ location: [35.6762, 139.6503], size: 0.1 },
					],
					onRender: (state) => {
						if (pointerInteracting.current === null) {
							phiRef.current += 0.005;
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
				maxWidth: 1000,
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

const features = [
	{
		icon: MapPin,
		title: "Hyper-Local 500m Grid",
		description:
			"H3 hexagonal cells map every pocket of pollution at street-level resolution.",
		gradient: "from-cyan-500 to-blue-600",
	},
	{
		icon: Brain,
		title: "Decision Intelligence",
		description:
			"AI-powered source attribution identifies exactly what is causing bad air quality.",
		gradient: "from-purple-500 to-pink-600",
	},
	{
		icon: Zap,
		title: "Urban Heat Islands",
		description:
			'Detect concrete "heat traps" that amplify both temperature and pollution.',
		gradient: "from-orange-500 to-red-600",
	},
	{
		icon: Shield,
		title: "Threshold Actions",
		description:
			"Automated government alerts when environmental risk scores breach safety limits.",
		gradient: "from-emerald-500 to-teal-600",
	},
];

function LandingPage() {
	const { isSignedIn } = useUser();
	const navigate = useNavigate();

	useEffect(() => {
		if (isSignedIn) {
			navigate({ to: "/dashboard" });
		}
	}, [isSignedIn, navigate]);

	return (
		<div className="min-h-screen bg-[#09090b] text-white overflow-hidden">
			{/* Nav */}
			<nav className="fixed top-0 w-full z-50 border-b border-white/5 bg-[#09090b]/80 backdrop-blur-xl">
				<div className="max-w-7xl mx-auto px-6 py-4 flex items-center justify-between">
					<div className="flex items-center gap-3">
						<div className="w-2.5 h-2.5 rounded-full bg-gradient-to-r from-emerald-400 to-cyan-400 animate-pulse" />
						<span className="text-lg font-bold tracking-tight">
							AirSentinel
						</span>
						<span className="text-[10px] tracking-[0.25em] text-zinc-500 uppercase font-semibold">
							OS
						</span>
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
								className="px-5 py-2.5 text-sm font-medium bg-white text-black rounded-xl hover:bg-zinc-200 transition-all cursor-pointer"
							>
								Get Started
							</button>
						</SignUpButton>
					</div>
				</div>
			</nav>

			{/* Hero Section */}
			<section className="relative min-h-screen flex items-center pt-32 pb-20 px-6">
				{/* Background Globe Component */}
				<div className="absolute inset-0 w-full h-full z-0 flex items-center justify-center pointer-events-auto overflow-hidden">
					<div className="w-full h-full transform scale-125 sm:scale-150 flex items-center justify-center opacity-90 mix-blend-screen mix-blend-lighten max-w-7xl">
						<Globe />
					</div>

					{/* Minimal Shadow Overlay behind text to ensure text is legible but globe is bright */}
					<div className="absolute inset-0 bg-gradient-to-t from-[#09090b] via-[#09090b]/40 to-transparent pointer-events-none" />
				</div>

				<div className="max-w-5xl mx-auto text-center relative z-10 w-full mt-[-5vh] drop-shadow-[0_0_15px_rgba(0,0,0,0.8)] pointer-events-none">
					<motion.div
						initial={{ opacity: 0, y: 30 }}
						animate={{ opacity: 1, y: 0 }}
						transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
					>
						<div className="inline-flex items-center gap-2 px-4 py-2 rounded-full border border-white/20 bg-black/40 backdrop-blur-xl mb-8 shadow-2xl">
							<div className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
							<span className="text-xs font-semibold tracking-wide text-zinc-300 uppercase">
								Real-time Environmental Monitoring
							</span>
						</div>

						<h1 className="text-5xl sm:text-6xl md:text-7xl lg:text-8xl font-black tracking-tight leading-[1] mb-6 drop-shadow-2xl">
							<span className="bg-gradient-to-b from-white to-zinc-400 bg-clip-text text-transparent">
								Your City&apos;s
							</span>
							<br />
							<span className="bg-gradient-to-r from-emerald-400 via-cyan-400 to-blue-500 bg-clip-text text-transparent drop-shadow-[0_0_30px_rgba(52,211,153,0.3)]">
								Digital Twin
							</span>
						</h1>

						<p className="text-lg sm:text-2xl text-zinc-300 max-w-2xl mx-auto mb-10 leading-relaxed font-medium drop-shadow-lg">
							A 3D environmental intelligence platform that maps pollution, heat
							islands, and air quality at{" "}
							<span className="text-white font-bold">500-meter resolution</span>
							.
						</p>
					</motion.div>

					<motion.div
						initial={{ opacity: 0, y: 20 }}
						animate={{ opacity: 1, y: 0 }}
						transition={{ duration: 0.8, delay: 0.3, ease: [0.16, 1, 0.3, 1] }}
						className="flex flex-col sm:flex-row gap-4 justify-center pointer-events-auto"
					>
						<SignUpButton mode="modal">
							<button
								type="button"
								className="group relative px-8 py-4 bg-gradient-to-r from-emerald-500 to-cyan-500 text-black font-bold rounded-2xl transition-transform duration-300 hover:scale-105 active:scale-95 overflow-hidden shadow-[0_0_40px_rgba(16,185,129,0.3)] hover:shadow-[0_0_60px_rgba(16,185,129,0.5)] flex items-center justify-center gap-2 cursor-pointer"
							>
								<div className="absolute inset-0 bg-white/20 translate-y-full group-hover:translate-y-0 transition-transform duration-300 ease-out" />
								<span className="relative z-10 flex items-center gap-2">
									Launch Dashboard
									<ArrowRight className="w-5 h-5 group-hover:translate-x-1.5 transition-transform" />
								</span>
							</button>
						</SignUpButton>
						<a
							href="https://github.com/Rudra1959/IIOC-26"
							target="_blank"
							rel="noreferrer"
							className="px-8 py-4 border-2 border-white/10 text-white font-bold rounded-2xl hover:bg-white/10 hover:border-white/30 transition-transform duration-300 text-center backdrop-blur-xl hover:scale-105 active:scale-95 shadow-xl cursor-pointer"
						>
							View on GitHub
						</a>
					</motion.div>
				</div>
			</section>

			{/* Features */}
			<section className="py-32 px-6 relative z-10">
				<div className="max-w-6xl mx-auto">
					<motion.div
						initial={{ opacity: 0, y: 40 }}
						whileInView={{ opacity: 1, y: 0 }}
						viewport={{ once: true, margin: "-100px" }}
						transition={{ duration: 0.8, ease: "easeOut" }}
						className="text-center mb-20"
					>
						<h2 className="text-4xl sm:text-5xl font-black mb-6 tracking-tight drop-shadow-xl text-white">
							Built for City-Scale Intelligence
						</h2>
						<p className="text-xl text-zinc-400 max-w-2xl mx-auto font-medium">
							Every feature is engineered for real-time environmental
							decision-making.
						</p>
					</motion.div>

					<div className="grid grid-cols-1 md:grid-cols-2 gap-6">
						{features.map((feature, i) => (
							<motion.div
								key={feature.title}
								initial={{ opacity: 0, scale: 0.95, y: 30 }}
								whileInView={{ opacity: 1, scale: 1, y: 0 }}
								viewport={{ once: true, margin: "-50px" }}
								transition={{ delay: i * 0.15, duration: 0.6, ease: "easeOut" }}
								whileHover={{ y: -5, scale: 1.02 }}
								className="group relative p-8 rounded-3xl border border-white/10 bg-[#09090b]/40 backdrop-blur-xl overflow-hidden shadow-2xl transition-all duration-500 hover:border-white/20 hover:shadow-[0_0_40px_rgba(255,255,255,0.05)] cursor-pointer"
							>
								<div className="absolute inset-0 bg-gradient-to-br from-white/[0.05] to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none" />

								<div
									className={`w-14 h-14 rounded-2xl bg-gradient-to-br ${feature.gradient} flex items-center justify-center mb-6 shadow-lg group-hover:shadow-2xl group-hover:scale-110 transition-all duration-500`}
								>
									<feature.icon className="w-7 h-7 text-white" />
								</div>
								<h3 className="text-2xl font-bold mb-3 tracking-tight text-white">
									{feature.title}
								</h3>
								<p className="text-base text-zinc-400 leading-relaxed font-medium">
									{feature.description}
								</p>

								<div
									className={`absolute bottom-0 left-0 h-1 w-0 bg-gradient-to-r ${feature.gradient} group-hover:w-full transition-all duration-700 ease-out`}
								/>
							</motion.div>
						))}
					</div>
				</div>
			</section>

			{/* CTA */}
			<section className="py-32 px-6 relative z-10">
				<div className="max-w-4xl mx-auto text-center">
					<motion.div
						initial={{ opacity: 0, scale: 0.95, y: 40 }}
						whileInView={{ opacity: 1, scale: 1, y: 0 }}
						viewport={{ once: true }}
						transition={{ duration: 0.8, ease: "backOut" }}
						className="p-12 sm:p-16 rounded-[3rem] border border-white/10 bg-gradient-to-br from-white/[0.05] to-transparent backdrop-blur-2xl shadow-2xl relative overflow-hidden group"
					>
						<div className="absolute inset-0 bg-gradient-to-r from-emerald-500/10 to-cyan-500/10 opacity-0 group-hover:opacity-100 transition-opacity duration-700 pointer-events-none" />
						<h2 className="text-4xl sm:text-5xl lg:text-6xl font-black mb-6 tracking-tight text-white drop-shadow-xl relative z-10">
							Ready to monitor your city?
						</h2>
						<p className="text-xl text-zinc-400 mb-10 max-w-2xl mx-auto font-medium relative z-10">
							Join the platform governments and citizens trust for real-time air
							quality intelligence.
						</p>
						<div className="relative z-10 flex justify-center">
							<SignUpButton mode="modal">
								<button
									type="button"
									className="px-10 py-5 bg-white text-black font-bold text-lg rounded-2xl hover:scale-105 active:scale-95 transition-transform duration-300 shadow-[0_0_40px_rgba(255,255,255,0.3)] hover:shadow-[0_0_60px_rgba(255,255,255,0.5)] cursor-pointer"
								>
									Create Free Account
								</button>
							</SignUpButton>
						</div>
					</motion.div>
				</div>
			</section>

			{/* Footer */}
			<footer className="border-t border-white/5 py-8 px-6">
				<div className="max-w-7xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-4">
					<div className="flex items-center gap-2">
						<div className="w-2 h-2 rounded-full bg-emerald-400" />
						<span className="text-sm text-zinc-600">AirSentinel OS</span>
					</div>
					<p className="text-xs text-zinc-700">
						{"\u00A9"} 2026 Environmental Intelligence Platform
					</p>
				</div>
			</footer>
		</div>
	);
}
