import { ProgressRing } from "./ProgressRing";

interface WeatherCardProps {
	temperature?: number;
	feelsLike?: number;
	humidity?: number;
	windSpeed?: number;
	uvIndex?: number;
	visibility?: number;
	weatherCondition?: string;
}

const weatherIcons: Record<string, React.ReactNode> = {
	clear: (
		<svg
			className="h-12 w-12 text-amber-400"
			fill="currentColor"
			viewBox="0 0 24 24"
			aria-label="Clear weather"
		>
			<path d="M12 2.25a.75.75 0 01.75.75v2.25a.75.75 0 01-1.5 0V3a.75.75 0 01.75-.75zM7.5 12a4.5 4.5 0 119 0 4.5 4.5 0 01-9 0zM18.894 6.166a.75.75 0 00-1.06-1.06l-1.591 1.59a.75.75 0 101.06 1.061l1.591-1.59zM21.75 12a.75.75 0 01-.75.75h-2.25a.75.75 0 010-1.5H21a.75.75 0 01.75.75zM17.834 18.894a.75.75 0 001.06-1.06l-1.59-1.591a.75.75 0 10-1.061 1.06l1.59 1.591zM12 18a.75.75 0 01.75.75V21a.75.75 0 01-1.5 0v-2.25A.75.75 0 0112 18zM7.758 17.303a.75.75 0 00-1.061-1.06l-1.591 1.59a.75.75 0 001.06 1.061l1.591-1.59zM6 12a.75.75 0 01-.75.75H3a.75.75 0 010-1.5h2.25A.75.75 0 016 12zM6.697 7.757a.75.75 0 001.06-1.06l-1.59-1.591a.75.75 0 00-1.061 1.06l1.59 1.591z" />
		</svg>
	),
	cloudy: (
		<svg
			className="h-12 w-12 text-zinc-400"
			fill="currentColor"
			viewBox="0 0 24 24"
			aria-label="Cloudy weather"
		>
			<path d="M4.5 9.75a6 6 0 0111.573-2.226 3.75 3.75 0 014.133 4.303A4.5 4.5 0 0118 20.25H6.75a5.25 5.25 0 01-2.23-10.004 6.072 6.072 0 01-.02-.496z" />
		</svg>
	),
	rain: (
		<svg
			className="h-12 w-12 text-blue-400"
			fill="currentColor"
			viewBox="0 0 24 24"
			aria-label="Rainy weather"
		>
			<path d="M4.5 9.75a6 6 0 0111.573-2.226 3.75 3.75 0 014.133 4.303A4.5 4.5 0 0118 20.25H6.75a5.25 5.25 0 01-2.23-10.004 6.072 6.072 0 01-.02-.496z" />
			<path
				d="M8 16v4M12 16v4M16 16v4"
				stroke="currentColor"
				strokeWidth="2"
				strokeLinecap="round"
				fill="none"
			/>
		</svg>
	),
	storm: (
		<svg
			className="h-12 w-12 text-purple-400"
			fill="currentColor"
			viewBox="0 0 24 24"
			aria-label="Stormy weather"
		>
			<path d="M13 2L3 14h9l-1 8 10-12h-9l1-8z" />
		</svg>
	),
	snow: (
		<svg
			className="h-12 w-12 text-cyan-300"
			fill="currentColor"
			viewBox="0 0 24 24"
			aria-label="Snowy weather"
		>
			<path
				d="M12 2v8m0 0l-3-3m3 3l3-3M5 12h4m6 0h4M7.05 16.05l2.45-2.45m5.9 5.9l2.45-2.45"
				stroke="currentColor"
				strokeWidth="2"
				strokeLinecap="round"
				fill="none"
			/>
		</svg>
	),
};

export function WeatherCard({
	temperature = 24,
	feelsLike = 26,
	humidity = 65,
	windSpeed = 12,
	uvIndex = 5,
	visibility = 10,
	weatherCondition = "clear",
}: WeatherCardProps) {
	const weatherIcon = weatherIcons[weatherCondition] || weatherIcons.clear;

	return (
		<div className="rounded-2xl border border-white/[0.08] bg-[var(--glass-bg)] p-4 backdrop-blur-xl">
			<div className="mb-4 flex items-center justify-between">
				<div className="flex items-center gap-3">
					{weatherIcon}
					<div>
						<div className="flex items-baseline gap-1">
							<span className="text-4xl font-bold text-white">
								{temperature}
							</span>
							<span className="text-lg text-zinc-400">°C</span>
						</div>
						<p className="text-xs text-zinc-500">Feels like {feelsLike}°C</p>
					</div>
				</div>
				<div className="text-right">
					<p className="text-sm font-medium text-zinc-300 capitalize">
						{weatherCondition}
					</p>
					<p className="text-[10px] text-zinc-500">
						Visibility: {visibility} km
					</p>
				</div>
			</div>

			<div className="grid grid-cols-3 gap-3">
				<div className="flex flex-col items-center gap-1 rounded-lg bg-white/[0.02] p-2">
					<ProgressRing
						value={humidity}
						max={100}
						size={36}
						strokeWidth={3}
						color="#06b6d4"
						showValue
						label="Humidity"
					/>
				</div>

				<div className="flex flex-col items-center gap-1 rounded-lg bg-white/[0.02] p-2">
					<ProgressRing
						value={windSpeed}
						max={30}
						size={36}
						strokeWidth={3}
						color="#14b8a6"
						showValue
						label="Wind km/h"
					/>
				</div>

				<div className="flex flex-col items-center gap-1 rounded-lg bg-white/[0.02] p-2">
					<ProgressRing
						value={uvIndex}
						max={11}
						size={36}
						strokeWidth={3}
						color={uvIndex > 5 ? "#f97316" : "#22c55e"}
						showValue
						label="UV"
					/>
				</div>
			</div>
		</div>
	);
}
