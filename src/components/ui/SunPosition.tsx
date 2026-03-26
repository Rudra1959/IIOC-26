import { useMemo } from "react";

interface SunPositionProps {
	sunrise?: number;
	sunset?: number;
	currentTime?: number;
}

export function SunPosition({
	sunrise = 6,
	sunset = 18,
	currentTime = new Date().getHours(),
}: SunPositionProps) {
	const data = useMemo(() => {
		const totalDaylight = sunset - sunrise;
		const currentProgress = Math.max(
			0,
			Math.min(1, (currentTime - sunrise) / totalDaylight),
		);
		const isDay = currentTime >= sunrise && currentTime <= sunset;

		const arcRadius = 60;
		const centerX = 80;
		const centerY = 80;

		const angle = Math.PI - currentProgress * Math.PI;
		const sunX = centerX + arcRadius * Math.cos(angle);
		const sunY = centerY + arcRadius * Math.sin(angle);

		const moonProgress = (currentProgress + 0.5) % 1;
		const moonAngle = Math.PI - moonProgress * Math.PI;
		const moonX = centerX + arcRadius * Math.cos(moonAngle);
		const moonY = centerY + arcRadius * Math.sin(moonAngle);

		const formatHour = (h: number) => {
			const hour = Math.floor(h);
			const ampm = hour >= 12 ? "PM" : "AM";
			const displayHour = hour % 12 || 12;
			return `${displayHour}:00 ${ampm}`;
		};

		return {
			sunX,
			sunY,
			moonX,
			moonY,
			currentProgress,
			isDay,
			arcRadius,
			centerX,
			centerY,
			sunrise,
			sunset,
			currentTime,
			formatHour,
		};
	}, [sunrise, sunset, currentTime]);

	return (
		<div className="relative flex flex-col items-center gap-2 rounded-xl border border-white/[0.08] bg-white/[0.02] p-4">
			<div className="flex items-center justify-between w-full">
				<div className="flex items-center gap-2">
					<div className="flex h-8 w-8 items-center justify-center rounded-full bg-gradient-to-br from-orange-400 to-amber-500 shadow-lg shadow-orange-500/30">
						<svg
							className="h-4 w-4 text-white"
							fill="currentColor"
							viewBox="0 0 24 24"
							aria-label="Sun icon"
						>
							<path d="M12 2.25a.75.75 0 01.75.75v2.25a.75.75 0 01-1.5 0V3a.75.75 0 01.75-.75zM7.5 12a4.5 4.5 0 119 0 4.5 4.5 0 01-9 0zM18.894 6.166a.75.75 0 00-1.06-1.06l-1.591 1.59a.75.75 0 101.06 1.061l1.591-1.59zM21.75 12a.75.75 0 01-.75.75h-2.25a.75.75 0 010-1.5H21a.75.75 0 01.75.75zM17.834 18.894a.75.75 0 001.06-1.06l-1.59-1.591a.75.75 0 10-1.061 1.06l1.59 1.591zM12 18a.75.75 0 01.75.75V21a.75.75 0 01-1.5 0v-2.25A.75.75 0 0112 18zM7.758 17.303a.75.75 0 00-1.061-1.06l-1.591 1.59a.75.75 0 001.06 1.061l1.591-1.59zM6 12a.75.75 0 01-.75.75H3a.75.75 0 010-1.5h2.25A.75.75 0 016 12zM6.697 7.757a.75.75 0 001.06-1.06l-1.59-1.591a.75.75 0 00-1.061 1.06l1.59 1.591z" />
						</svg>
					</div>
					<div>
						<p className="text-[10px] text-zinc-500 uppercase tracking-wider">
							Sunrise
						</p>
						<p className="text-xs font-semibold text-white">
							{data.formatHour(data.sunrise)}
						</p>
					</div>
				</div>

				<div className="flex items-center gap-2">
					<div>
						<p className="text-[10px] text-zinc-500 uppercase tracking-wider">
							Sunset
						</p>
						<p className="text-xs font-semibold text-white">
							{data.formatHour(data.sunset)}
						</p>
					</div>
					<div className="flex h-8 w-8 items-center justify-center rounded-full bg-gradient-to-br from-indigo-500 to-purple-600 shadow-lg shadow-purple-500/30">
						<svg
							className="h-4 w-4 text-white"
							fill="currentColor"
							viewBox="0 0 24 24"
							aria-label="Moon icon"
						>
							<path
								fillRule="evenodd"
								d="M9.528 1.718a.75.75 0 01.162.819A8.97 8.97 0 009 6a9 9 0 009 9 8.97 8.97 0 003.463-.69.75.75 0 01.981.98 10.503 10.503 0 01-9.694 6.46c-5.799 0-10.5-4.701-10.5-10.5 0-4.368 2.667-8.112 6.46-9.694a.75.75 0 01.818.162z"
								clipRule="evenodd"
							/>
						</svg>
					</div>
				</div>
			</div>

			<div className="relative h-[100px] w-[160px]">
				<svg
					viewBox="0 0 160 120"
					className="h-full w-full"
					aria-label="Sun position arc"
				>
					<defs>
						<linearGradient id="skyGradient" x1="0%" y1="0%" x2="0%" y2="100%">
							<stop offset="0%" stopColor="#1e3a5f" />
							<stop offset="50%" stopColor="#4a90a4" />
							<stop offset="100%" stopColor="#f59e0b" />
						</linearGradient>
						<linearGradient id="sunGlow" x1="0%" y1="0%" x2="100%" y2="100%">
							<stop offset="0%" stopColor="#fbbf24" />
							<stop offset="100%" stopColor="#f97316" />
						</linearGradient>
						<filter id="glow">
							<feGaussianBlur stdDeviation="3" result="coloredBlur" />
							<feMerge>
								<feMergeNode in="coloredBlur" />
								<feMergeNode in="SourceGraphic" />
							</feMerge>
						</filter>
					</defs>

					<path
						d={`M ${20} ${80} A 60 60 0 0 1 ${140} ${80}`}
						fill="none"
						stroke="rgba(255, 255, 255, 0.2)"
						strokeWidth="2"
						strokeDasharray="4 4"
					/>

					<path
						d={`M ${20} ${80} A 60 60 0 0 1 ${140} ${80}`}
						fill="none"
						stroke="url(#skyGradient)"
						strokeWidth="3"
						strokeLinecap="round"
						opacity="0.3"
					/>

					{data.isDay && (
						<g filter="url(#glow)">
							<circle
								cx={data.sunX}
								cy={data.sunY}
								r="12"
								fill="url(#sunGlow)"
							/>
							<circle cx={data.sunX} cy={data.sunY} r="8" fill="#fbbf24" />
							<circle
								cx={data.sunX}
								cy={data.sunY}
								r="20"
								fill="url(#sunGlow)"
								opacity="0.3"
							/>
						</g>
					)}

					{!data.isDay && (
						<g filter="url(#glow)">
							<circle cx={data.moonX} cy={data.moonY} r="10" fill="#e2e8f0" />
							<circle
								cx={data.moonX - 3}
								cy={data.moonY - 2}
								r="8"
								fill="#1e293b"
							/>
						</g>
					)}

					<circle cx={20} cy={80} r="3" fill="rgba(255, 255, 255, 0.5)" />
					<circle cx={140} cy={80} r="3" fill="rgba(255, 255, 255, 0.5)" />
				</svg>
			</div>

			<div className="flex items-center justify-center gap-2">
				<span
					className={`h-2 w-2 rounded-full ${data.isDay ? "bg-amber-400 animate-pulse" : "bg-indigo-400"}`}
				/>
				<span className="text-[10px] text-zinc-400">
					{data.isDay ? "Daytime" : "Nighttime"} •{" "}
					{data.formatHour(currentTime)}
				</span>
			</div>
		</div>
	);
}
