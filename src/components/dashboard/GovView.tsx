import { motion } from "framer-motion";
import { useEffect } from "react";
import { useEnvStore } from "#/store/envStore";
import { ChemicalFingerprint } from "./ChemicalFingerprint";

interface GovSource {
	score: number;
	attributedSource: string;
	aqi: number;
	isIdlingRisk: boolean;
}

interface DeployedResource {
	id: string;
	type: "water-tanker" | "air-purifier" | "monitoring-station";
	name: string;
	status: "active" | "idle" | "deployed";
	coverage: number;
}

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

const MOCK_RESOURCES: DeployedResource[] = [
	{
		id: "WT-001",
		type: "water-tanker",
		name: "Water Tanker WT-001",
		status: "active",
		coverage: 88,
	},
	{
		id: "WT-002",
		type: "water-tanker",
		name: "Water Tanker WT-002",
		status: "active",
		coverage: 72,
	},
	{
		id: "WT-003",
		type: "water-tanker",
		name: "Water Tanker WT-003",
		status: "idle",
		coverage: 0,
	},
	{
		id: "AP-101",
		type: "air-purifier",
		name: "Air Purifier AP-101",
		status: "active",
		coverage: 95,
	},
	{
		id: "AP-102",
		type: "air-purifier",
		name: "Air Purifier AP-102",
		status: "active",
		coverage: 82,
	},
	{
		id: "AP-103",
		type: "air-purifier",
		name: "Air Purifier AP-103",
		status: "idle",
		coverage: 0,
	},
	{
		id: "MON-501",
		type: "monitoring-station",
		name: "Station MON-501",
		status: "active",
		coverage: 100,
	},
	{
		id: "MON-502",
		type: "monitoring-station",
		name: "Station MON-502",
		status: "active",
		coverage: 100,
	},
];

function CoverageGauge({ percentage }: { percentage: number }) {
	const getColor = (pct: number) => {
		if (pct >= 80) return "#22c55e";
		if (pct >= 50) return "#eab308";
		return "#ef4444";
	};

	return (
		<div className="flex flex-col items-center gap-1">
			<svg
				viewBox="0 0 100 60"
				className="h-16 w-28"
				aria-label={`Coverage gauge at ${Math.round(percentage)}%`}
			>
				<title>Coverage Gauge</title>
				<path
					d="M 10 55 A 40 40 0 0 1 90 55"
					fill="none"
					stroke="#27272a"
					strokeWidth="8"
					strokeLinecap="round"
				/>
				<path
					d="M 10 55 A 40 40 0 0 1 90 55"
					fill="none"
					stroke={getColor(percentage)}
					strokeWidth="8"
					strokeLinecap="round"
					strokeDasharray={`${(percentage / 100) * 126} 126`}
					style={{
						transition: "stroke-dasharray 1s ease-out, stroke 0.5s ease",
					}}
				/>
				<text
					x="50"
					y="50"
					textAnchor="middle"
					fill="white"
					fontSize="16"
					fontWeight="900"
					fontFamily="monospace"
				>
					{Math.round(percentage)}%
				</text>
			</svg>
			<p className="text-[10px] uppercase tracking-wider text-zinc-500">
				Coverage
			</p>
		</div>
	);
}

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

	const activeResources = MOCK_RESOURCES.filter((r) => r.status !== "idle");
	const totalCoverage = Math.round(
		activeResources.reduce((sum, r) => sum + r.coverage, 0) /
			Math.max(activeResources.length, 1),
	);

	const waterTankers = MOCK_RESOURCES.filter((r) => r.type === "water-tanker");
	const purifiers = MOCK_RESOURCES.filter((r) => r.type === "air-purifier");
	const stations = MOCK_RESOURCES.filter(
		(r) => r.type === "monitoring-station",
	);

	return (
		<motion.div
			initial={{ opacity: 0, x: 50 }}
			animate={{ opacity: 1, x: 0 }}
			transition={{ duration: 0.6, ease: "easeOut" }}
			className="pointer-events-auto absolute top-20 right-4 w-80 space-y-3 rounded-2xl border border-white/5 bg-[#09090b]/80 p-5 text-white shadow-2xl backdrop-blur-2xl sm:w-96 panel-glass"
		>
			<div className="flex items-center justify-between">
				<h3 className="text-xs font-bold uppercase tracking-[0.2em] text-gray-400">
					Regional Command Center
				</h3>
				<div className="flex items-center gap-2">
					<span className="text-[10px] text-zinc-500">
						{activeResources.length} assets active
					</span>
					<div className="h-2 w-2 rounded-full bg-red-500 animate-pulse" />
				</div>
			</div>

			<div className="relative overflow-hidden rounded-xl border border-white/10 bg-white/5 p-4">
				<div className="absolute top-0 right-0 h-32 w-32 rounded-full bg-blue-500/10 blur-3xl" />
				<h4 className="mb-2 text-xs uppercase tracking-wider text-gray-400">
					Automated Response Protocol
				</h4>
				<p className={`text-sm font-medium ${actionColor}`}>{actionRequired}</p>
				{highestRisk > 85 && (
					<p className="mt-2 text-xs text-red-400 animate-pulse">
						Push Notification Dispatched: &quot;Hazard Detected.&quot;
					</p>
				)}
			</div>

			<div className="flex items-center gap-3 rounded-xl border border-white/10 bg-white/5 p-4">
				<div className="flex-1">
					<h4 className="mb-1 text-xs uppercase tracking-wider text-gray-400">
						Deployment Coverage
					</h4>
					<div className="space-y-1.5">
						<div className="flex items-center justify-between">
							<div className="flex items-center gap-1.5">
								<div className="h-2 w-2 rounded-full bg-sky-400" />
								<span className="text-[10px] text-zinc-400">Water Tankers</span>
							</div>
							<span className="text-xs font-bold text-sky-400">
								{waterTankers.filter((r) => r.status === "active").length}/
								{waterTankers.length}
							</span>
						</div>
						<div className="flex items-center justify-between">
							<div className="flex items-center gap-1.5">
								<div className="h-2 w-2 rounded-full bg-emerald-400" />
								<span className="text-[10px] text-zinc-400">Air Purifiers</span>
							</div>
							<span className="text-xs font-bold text-emerald-400">
								{purifiers.filter((r) => r.status === "active").length}/
								{purifiers.length}
							</span>
						</div>
						<div className="flex items-center justify-between">
							<div className="flex items-center gap-1.5">
								<div className="h-2 w-2 rounded-full bg-violet-400" />
								<span className="text-[10px] text-zinc-400">Mon. Stations</span>
							</div>
							<span className="text-xs font-bold text-violet-400">
								{stations.filter((r) => r.status === "active").length}/
								{stations.length}
							</span>
						</div>
					</div>
				</div>
				<CoverageGauge percentage={totalCoverage} />
			</div>

			<h4 className="mb-2 text-xs uppercase tracking-wider text-gray-400">
				Atmospheric Threat Attribution
			</h4>
			<div className="space-y-2">
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

			<ChemicalFingerprint
				pm25={35}
				pm10={65}
				no2={40}
				ozone={50}
				so2={15}
				co={1}
			/>
		</motion.div>
	);
}
