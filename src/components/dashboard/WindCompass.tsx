import { useEffect, useRef } from "react";

interface WindCompassProps {
	direction: number | null;
	speed: number | null;
	gusts: number | null;
	size?: number;
}

export function WindCompass({
	direction,
	speed,
	gusts,
	size = 72,
}: WindCompassProps) {
	const arrowRef = useRef<SVGGElement>(null);
	const animRef = useRef<number>(0);

	const speedColor =
		speed === null
			? "#6b7280"
			: speed < 10
				? "#22c55e"
				: speed < 20
					? "#eab308"
					: speed < 30
						? "#f97316"
						: "#dc2626";

	const displaySpeed = speed ?? 0;

	const cardinals = [
		{ label: "N", angle: 0 },
		{ label: "E", angle: 90 },
		{ label: "S", angle: 180 },
		{ label: "W", angle: 270 },
	];

	useEffect(() => {
		if (!arrowRef.current) return;
		let wobble = 0;
		const animate = () => {
			wobble = Math.sin(Date.now() / 800) * 2;
			if (arrowRef.current) {
				const baseRotate = direction ?? 0;
				arrowRef.current.style.transform = `rotate(${baseRotate + wobble}deg)`;
			}
			animRef.current = requestAnimationFrame(animate);
		};
		animRef.current = requestAnimationFrame(animate);
		return () => cancelAnimationFrame(animRef.current);
	}, [direction]);

	const cx = size / 2;
	const cy = size / 2;
	const r = (size / 2) * 0.75;

	return (
		<div className="flex flex-col items-center gap-1">
			<svg
				width={size}
				height={size}
				viewBox={`0 0 ${size} ${size}`}
				className="overflow-visible"
				role="img"
				aria-label={`Wind compass showing ${displaySpeed} km/h from ${direction ?? 0} degrees`}
			>
				<defs>
					<radialGradient id={`wg-${size}`} cx="50%" cy="50%" r="50%">
						<stop offset="0%" stopColor={speedColor} stopOpacity="0.1" />
						<stop offset="100%" stopColor={speedColor} stopOpacity="0.02" />
					</radialGradient>
					<filter id={`glow-${size}`}>
						<feGaussianBlur stdDeviation="1.5" result="coloredBlur" />
						<feMerge>
							<feMergeNode in="coloredBlur" />
							<feMergeNode in="SourceGraphic" />
						</feMerge>
					</filter>
				</defs>

				<circle
					cx={cx}
					cy={cy}
					r={r}
					fill={`url(#wg-${size})`}
					stroke={speedColor}
					strokeWidth={0.5}
					strokeOpacity={0.4}
				/>

				{cardinals.map((c) => {
					const rad = (c.angle - 90) * (Math.PI / 180);
					const labelR = r + 8;
					return (
						<g key={c.label}>
							<line
								x1={cx + Math.cos(rad) * (r - 4)}
								y1={cy + Math.sin(rad) * (r - 4)}
								x2={cx + Math.cos(rad) * r}
								y2={cy + Math.sin(rad) * r}
								stroke={speedColor}
								strokeWidth={1}
								strokeOpacity={0.6}
							/>
							<text
								x={cx + Math.cos(rad) * labelR}
								y={cy + Math.sin(rad) * labelR}
								textAnchor="middle"
								dominantBaseline="central"
								fill={speedColor}
								fontSize={7}
								fontFamily="monospace"
								fontWeight="bold"
								opacity={0.8}
							>
								{c.label}
							</text>
						</g>
					);
				})}

				{[30, 60, 120, 150].map((a) => {
					const rad = (a - 90) * (Math.PI / 180);
					return (
						<line
							key={a}
							x1={cx + Math.cos(rad) * (r - 3)}
							y1={cy + Math.sin(rad) * (r - 3)}
							x2={cx + Math.cos(rad) * r}
							y2={cy + Math.sin(rad) * r}
							stroke={speedColor}
							strokeWidth={0.5}
							strokeOpacity={0.2}
						/>
					);
				})}

				<g
					ref={arrowRef}
					style={{
						transformOrigin: `${cx}px ${cy}px`,
						transition: "transform 0.3s ease",
					}}
				>
					<polygon
						points={`${cx},${cy - r * 0.65} ${cx - 4},${cy + 4} ${cx},${cy - r * 0.2} ${cx + 4},${cy + 4}`}
						fill={speedColor}
						opacity={0.9}
						filter={`url(#glow-${size})`}
					/>
					<circle cx={cx} cy={cy} r={2.5} fill={speedColor} opacity={0.6} />
				</g>

				<circle
					cx={cx}
					cy={cy}
					r={2}
					fill="#09090b"
					stroke={speedColor}
					strokeWidth={1}
				/>
			</svg>

			<div className="text-center">
				<span
					className="font-mono text-[10px] font-bold"
					style={{ color: speedColor }}
				>
					{speed !== null ? `${Math.round(speed)} km/h` : "-- km/h"}
				</span>
				{gusts !== null && gusts > displaySpeed + 5 && (
					<span className="ml-1 font-mono text-[8px] text-orange-400">
						G{`${Math.round(gusts)}`}
					</span>
				)}
			</div>
		</div>
	);
}
