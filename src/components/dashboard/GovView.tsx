import { motion } from "framer-motion";
import { useEffect } from "react";
import { useEnvStore } from "#/store/envStore";

interface GovSource {
	score: number;
	attributedSource: string;
	aqi: number;
	isIdlingRisk: boolean;
}

// Mock intelligence data - no API needed
const MOCK_SOURCES: GovSource[] = [
	{
		score: 88,
		attributedSource: "Vehicle Idling / Traffic Emissions",
		aqi: 142,
		isIdlingRisk: true,
	},
	{
		score: 76,
		attributedSource: "Urban Heat Island Effect",
		aqi: 98,
		isIdlingRisk: false,
	},
	{
		score: 64,
		attributedSource: "Industrial Biomass Combustion",
		aqi: 85,
		isIdlingRisk: false,
	},
];

export function GovView() {
	const { identifiedSources, setInsights } = useEnvStore();

	useEffect(() => {
		setInsights({ cityAverageUHI: 25, identifiedSources: MOCK_SOURCES });
	}, [setInsights]);

	if (!identifiedSources.length) return null;

	const highestRisk = identifiedSources[0]?.score || 0;
	let actionRequired = "";
	let actionColor = "text-green-400";

	if (highestRisk > 85) {
		actionRequired = "Traffic diversion + Construction halt";
		actionColor = "text-red-500";
	} else if (highestRisk > 70) {
		actionRequired = "Deploy water sprinklers in High-Risk Grids";
		actionColor = "text-orange-500";
	} else if (highestRisk > 60) {
		actionRequired = "Increase street sweeping frequency";
		actionColor = "text-yellow-400";
	} else {
		actionRequired = "Standard monitoring active";
	}

	return (
		<motion.div
			initial={{ opacity: 0, x: 50 }}
			animate={{ opacity: 1, x: 0 }}
			transition={{ duration: 0.6, ease: "easeOut" }}
			className="pointer-events-auto absolute top-20 right-4 w-80 rounded-2xl border border-white/5 bg-[#09090b]/80 p-5 text-white shadow-2xl backdrop-blur-2xl sm:w-96"
		>
			<div className="mb-5 flex items-center justify-between">
				<h3 className="text-xs font-bold uppercase tracking-[0.2em] text-gray-400">
					Command Center
				</h3>
				<div className="h-2 w-2 rounded-full bg-red-500 animate-pulse" />
			</div>

			<div className="relative mb-5 overflow-hidden rounded-xl border border-white/10 bg-white/5 p-4">
				<div className="absolute top-0 right-0 h-32 w-32 rounded-full bg-blue-500/10 blur-3xl" />
				<h4 className="mb-2 text-xs uppercase tracking-wider text-gray-400">
					Automated Action Matrix
				</h4>
				<p className={`text-sm font-medium ${actionColor}`}>{actionRequired}</p>
				{highestRisk > 85 && (
					<p className="mt-2 text-xs text-red-400 animate-pulse">
						Push Notification Dispatched: &quot;Hazard Detected.&quot;
					</p>
				)}
			</div>

			<h4 className="mb-3 text-xs uppercase tracking-wider text-gray-400">
				Live Threat Attribution
			</h4>
			<div className="space-y-2.5">
				{identifiedSources.slice(0, 3).map((source) => (
					<div
						key={source.attributedSource}
						className="rounded-xl border border-white/10 bg-white/5 p-3 transition-colors hover:bg-white/10"
					>
						<div className="flex items-start justify-between">
							<div className="min-w-0 flex-1">
								<p className="mb-0.5 text-xs font-medium text-red-400">
									Risk {Math.round(source.score)}
								</p>
								<h4 className="truncate text-sm font-bold">
									{source.attributedSource}
								</h4>
							</div>
							<div className="ml-2 text-right">
								<p className="text-xs text-gray-400">AQI</p>
								<p className="text-sm font-bold">
									{Math.round(source.aqi || 0)}
								</p>
							</div>
						</div>
						{source.isIdlingRisk && (
							<div className="mt-2 inline-block rounded border border-red-500/20 bg-red-500/10 px-2 py-1 text-[10px] text-red-300">
								Traffic Idling Detected
							</div>
						)}
					</div>
				))}
			</div>
		</motion.div>
	);
}
