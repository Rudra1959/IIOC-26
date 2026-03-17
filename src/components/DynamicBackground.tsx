import { useEnvStore } from "../store/envStore";

/** Floating ambient particles for the Bloom AI aesthetic */
function FloatingParticles() {
	return (
		<div className="pointer-events-none fixed inset-0 z-[-1] overflow-hidden">
			{Array.from({ length: 20 }).map((_, i) => {
				const size = 1 + Math.random() * 2;
				const left = Math.random() * 100;
				const delay = Math.random() * 15;
				const duration = 12 + Math.random() * 18;
				const opacity = 0.15 + Math.random() * 0.3;
				return (
					<div
						key={`particle-${i}`}
						className="absolute rounded-full bg-emerald-400"
						style={{
							width: size,
							height: size,
							left: `${left}%`,
							bottom: "-4px",
							opacity,
							animation: `particle-drift ${duration}s ${delay}s linear infinite`,
						}}
					/>
				);
			})}
		</div>
	);
}

export function DynamicBackground() {
	const currentAqi = useEnvStore((state) => state.currentAqi);

	let gradient1 = "rgba(16, 185, 129, 0.12)";
	let gradient2 = "rgba(6, 78, 59, 0.08)";

	if (currentAqi !== null) {
		if (currentAqi > 200) {
			gradient1 = "rgba(159, 18, 57, 0.15)";
			gradient2 = "rgba(88, 28, 135, 0.12)";
		} else if (currentAqi > 150) {
			gradient1 = "rgba(239, 68, 68, 0.12)";
			gradient2 = "rgba(153, 27, 27, 0.08)";
		} else if (currentAqi > 100) {
			gradient1 = "rgba(245, 158, 11, 0.12)";
			gradient2 = "rgba(180, 83, 9, 0.08)";
		} else if (currentAqi > 50) {
			gradient1 = "rgba(234, 179, 8, 0.12)";
			gradient2 = "rgba(202, 138, 4, 0.08)";
		}
	}

	return (
		<>
			<div
				className="pointer-events-none fixed inset-0 z-[-1] transition-all duration-[2s]"
				style={{
					backgroundImage: `
						radial-gradient(ellipse at 15% 5%, ${gradient1}, transparent 45%),
						radial-gradient(ellipse at 85% 15%, ${gradient2}, transparent 40%),
						radial-gradient(ellipse at 50% 90%, rgba(16, 185, 129, 0.04), transparent 50%)
					`,
				}}
			/>
			<FloatingParticles />
		</>
	);
}
