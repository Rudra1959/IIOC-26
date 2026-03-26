interface CircularGaugeProps {
	value: number;
	max?: number;
	label: string;
	unit?: string;
	size?: "sm" | "md" | "lg";
	variant?:
		| "aqi"
		| "pm25"
		| "temperature"
		| "humidity"
		| "wind"
		| "uv"
		| "default";
	showValue?: boolean;
	animated?: boolean;
}

const variantColors = {
	aqi: {
		gradient: [
			"#22c55e",
			"#22c55e",
			"#eab308",
			"#f97316",
			"#dc2626",
			"#a21caf",
		],
		stops: [0, 50, 100, 150, 200, 300],
	},
	pm25: {
		gradient: ["#3b82f6", "#22c55e", "#eab308", "#f97316", "#dc2626"],
		stops: [0, 12, 35.4, 55.4, 150],
	},
	temperature: {
		gradient: ["#3b82f6", "#22c55e", "#eab308", "#ef4444"],
		stops: [0, 15, 25, 35],
	},
	humidity: {
		gradient: ["#06b6d4", "#0891b2", "#0e7490", "#164e63"],
		stops: [0, 30, 60, 100],
	},
	wind: {
		gradient: ["#22c55e", "#14b8a6", "#06b6d4", "#f97316"],
		stops: [0, 5, 10, 20],
	},
	uv: {
		gradient: ["#22c55e", "#eab308", "#f97316", "#dc2626", "#a21caf"],
		stops: [0, 3, 6, 8, 11],
	},
	default: {
		gradient: ["#14b8a6", "#14b8a6"],
		stops: [0, 100],
	},
};

function getColorForValue(
	value: number,
	variant: keyof typeof variantColors,
): string {
	const config = variantColors[variant];
	const colors = config.gradient;
	const stops = config.stops;

	for (let i = stops.length - 1; i >= 0; i--) {
		if (value >= stops[i]) {
			if (i === stops.length - 1) return colors[i];
			const t = (value - stops[i]) / (stops[i + 1] - stops[i]);
			return interpolateColor(colors[i], colors[i + 1], t);
		}
	}
	return colors[0];
}

function interpolateColor(color1: string, color2: string, t: number): string {
	const c1 = hexToRgb(color1);
	const c2 = hexToRgb(color2);
	if (!c1 || !c2) return color1;

	const r = Math.round(c1.r + (c2.r - c1.r) * t);
	const g = Math.round(c1.g + (c2.g - c1.g) * t);
	const b = Math.round(c1.b + (c2.b - c1.b) * t);

	return `rgb(${r}, ${g}, ${b})`;
}

function hexToRgb(hex: string): { r: number; g: number; b: number } | null {
	const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
	return result
		? {
				r: parseInt(result[1], 16),
				g: parseInt(result[2], 16),
				b: parseInt(result[3], 16),
			}
		: null;
}

export function CircularGauge({
	value,
	max = 100,
	label,
	unit = "",
	size = "md",
	variant = "default",
	showValue = true,
	animated = true,
}: CircularGaugeProps) {
	const sizeConfig = {
		sm: { size: 80, strokeWidth: 6, fontSize: 16, labelSize: 8 },
		md: { size: 120, strokeWidth: 8, fontSize: 24, labelSize: 10 },
		lg: { size: 160, strokeWidth: 10, fontSize: 32, labelSize: 12 },
	};

	const config = sizeConfig[size];
	const radius = (config.size - config.strokeWidth) / 2;
	const circumference = 2 * Math.PI * radius;
	const normalizedValue = Math.min(Math.max(value, 0), max);
	const progress = (normalizedValue / max) * 100;
	const strokeDashoffset =
		circumference - (progress / 100) * circumference * 0.75;

	const mainColor = getColorForValue(normalizedValue, variant);

	const gradientId = `gauge-gradient-${variant}-${label.replace(/\s/g, "")}`;

	return (
		<div className="flex flex-col items-center gap-2">
			<div
				className="relative"
				style={{ width: config.size, height: config.size }}
			>
				<svg
					width={config.size}
					height={config.size}
					className="-rotate-[135deg]"
					aria-label={`${label} gauge: ${value}`}
				>
					<defs>
						<linearGradient id={gradientId} x1="0%" y1="0%" x2="100%" y2="100%">
							<stop offset="0%" stopColor={mainColor} stopOpacity="0.3" />
							<stop offset="100%" stopColor={mainColor} stopOpacity="1" />
						</linearGradient>
					</defs>
					<circle
						cx={config.size / 2}
						cy={config.size / 2}
						r={radius}
						fill="none"
						stroke="rgba(255, 255, 255, 0.1)"
						strokeWidth={config.strokeWidth}
						strokeDasharray={circumference}
						strokeLinecap="round"
					/>
					<circle
						cx={config.size / 2}
						cy={config.size / 2}
						r={radius}
						fill="none"
						stroke={`url(#${gradientId})`}
						strokeWidth={config.strokeWidth}
						strokeDasharray={circumference}
						strokeDashoffset={strokeDashoffset}
						strokeLinecap="round"
						className={animated ? "transition-all duration-1000 ease-out" : ""}
					/>
				</svg>
				<div className="absolute inset-0 flex flex-col items-center justify-center">
					{showValue && (
						<span
							className="font-bold text-white"
							style={{ fontSize: config.fontSize }}
						>
							{variant === "aqi"
								? Math.round(normalizedValue)
								: normalizedValue.toFixed(1)}
							{unit && (
								<span
									className="text-zinc-400"
									style={{ fontSize: config.labelSize }}
								>
									{unit}
								</span>
							)}
						</span>
					)}
				</div>
			</div>
			<span
				className="font-medium text-zinc-400"
				style={{ fontSize: config.labelSize }}
			>
				{label}
			</span>
		</div>
	);
}

interface MiniGaugeProps {
	value: number;
	max?: number;
	color?: string;
	size?: number;
}

export function MiniGauge({
	value,
	max = 100,
	color = "#14b8a6",
	size = 32,
}: MiniGaugeProps) {
	const radius = (size - 4) / 2;
	const circumference = 2 * Math.PI * radius;
	const progress = Math.min(Math.max(value / max, 0), 1);
	const strokeDashoffset = circumference - progress * circumference * 0.75;

	return (
		<div className="relative" style={{ width: size, height: size }}>
			<svg
				width={size}
				height={size}
				className="-rotate-[135deg]"
				aria-label="Progress ring"
			>
				<circle
					cx={size / 2}
					cy={size / 2}
					r={radius}
					fill="none"
					stroke="rgba(255, 255, 255, 0.1)"
					strokeWidth={3}
				/>
				<circle
					cx={size / 2}
					cy={size / 2}
					r={radius}
					fill="none"
					stroke={color}
					strokeWidth={3}
					strokeDasharray={circumference}
					strokeDashoffset={strokeDashoffset}
					strokeLinecap="round"
					className="transition-all duration-500"
				/>
			</svg>
		</div>
	);
}
