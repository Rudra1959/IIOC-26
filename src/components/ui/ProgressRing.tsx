interface ProgressRingProps {
	value: number;
	max?: number;
	size?: number;
	strokeWidth?: number;
	color?: string;
	trackColor?: string;
	showValue?: boolean;
	label?: string;
	animated?: boolean;
}

export function ProgressRing({
	value,
	max = 100,
	size = 48,
	strokeWidth = 4,
	color = "#14b8a6",
	trackColor = "rgba(255, 255, 255, 0.1)",
	showValue = false,
	label,
	animated = true,
}: ProgressRingProps) {
	const radius = (size - strokeWidth) / 2;
	const circumference = 2 * Math.PI * radius;
	const progress = Math.min(Math.max(value / max, 0), 1);
	const strokeDashoffset = circumference * (1 - progress);
	const percentage = Math.round(progress * 100);

	return (
		<div className="flex flex-col items-center gap-1">
			<div className="relative" style={{ width: size, height: size }}>
				<svg
					width={size}
					height={size}
					className="-rotate-90"
					aria-label={`${label || "Progress"}: ${percentage}%`}
				>
					<circle
						cx={size / 2}
						cy={size / 2}
						r={radius}
						fill="none"
						stroke={trackColor}
						strokeWidth={strokeWidth}
					/>
					<circle
						cx={size / 2}
						cy={size / 2}
						r={radius}
						fill="none"
						stroke={color}
						strokeWidth={strokeWidth}
						strokeDasharray={circumference}
						strokeDashoffset={strokeDashoffset}
						strokeLinecap="round"
						className={animated ? "transition-all duration-700 ease-out" : ""}
					/>
				</svg>
				{showValue && (
					<div className="absolute inset-0 flex items-center justify-center">
						<span className="text-[10px] font-bold text-white">
							{percentage}%
						</span>
					</div>
				)}
			</div>
			{label && (
				<span className="text-[8px] text-zinc-500 font-medium">{label}</span>
			)}
		</div>
	);
}

interface LinearProgressProps {
	value: number;
	max?: number;
	height?: number;
	color?: string;
	trackColor?: string;
	showValue?: boolean;
	label?: string;
	gradient?: boolean;
}

export function LinearProgress({
	value,
	max = 100,
	height = 6,
	color = "#14b8a6",
	trackColor = "rgba(255, 255, 255, 0.1)",
	showValue = false,
	label,
	gradient = true,
}: LinearProgressProps) {
	const progress = Math.min(Math.max(value / max, 0), 1);
	const percentage = Math.round(progress * 100);

	return (
		<div className="flex flex-col gap-1">
			{(label || showValue) && (
				<div className="flex items-center justify-between">
					{label && <span className="text-[10px] text-zinc-400">{label}</span>}
					{showValue && (
						<span className="text-[10px] font-medium text-zinc-300">
							{percentage}%
						</span>
					)}
				</div>
			)}
			<div
				className="w-full overflow-hidden rounded-full"
				style={{ height, backgroundColor: trackColor }}
			>
				<div
					className={`h-full rounded-full ${gradient ? "bg-gradient-to-r from-teal-400 to-cyan-400" : ""}`}
					style={{
						width: `${percentage}%`,
						backgroundColor: gradient ? undefined : color,
					}}
				/>
			</div>
		</div>
	);
}
