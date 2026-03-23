import { useQuery as useTanstackQuery } from "@tanstack/react-query";
import { motion } from "framer-motion";
import {
	AlertTriangle,
	Car,
	ChevronDown,
	Clock,
	Factory,
	Flame,
	Thermometer,
	Wind,
	Zap,
} from "lucide-react";
import { useMemo, useState } from "react";
import { fetchEnvironmentalSnapshot } from "#/lib/environment";
import { useEnvStore } from "#/store/envStore";

interface ThreatAlert {
	id: string;
	type: ThreatType;
	title: string;
	description: string;
	confidence: number;
	severity: "low" | "medium" | "high" | "critical";
	location: string;
	timeRange: string;
	primaryPollutant: string;
	icon: string;
	timestamp: number;
}

type ThreatType =
	| "traffic"
	| "industrial"
	| "crop_burning"
	| "thermal_inversion"
	| "construction"
	| "dust_storm";

interface PollutantData {
	pm25: number;
	pm10: number;
	no2: number;
	o3: number;
	so2: number;
	co: number;
	dust: number;
	hour: number;
	month: number;
	humidity: number;
	temp: number;
	windSpeed: number;
}

interface ThreatRule {
	id: string;
	type: ThreatType;
	check: (data: PollutantData) => boolean;
	title: string;
	description: string;
	primaryPollutant: string;
	icon: string;
}

const THREAT_RULES: ThreatRule[] = [
	{
		id: "traffic-surge",
		type: "traffic",
		check: (data) =>
			data.no2 > 60 &&
			data.no2 > data.pm25 * 0.8 &&
			data.hour >= 6 &&
			data.hour <= 10,
		title: "Anomaly: Commuter Traffic Surge",
		description:
			"NO2 spike during rush hour indicates heavy vehicle congestion",
		primaryPollutant: "NO2",
		icon: "car",
	},
	{
		id: "industrial-venting",
		type: "industrial",
		check: (data) =>
			data.so2 > 30 && data.pm25 > 80 && (data.hour >= 22 || data.hour <= 4),
		title: "Anomaly: Suspected Industrial Venting",
		description: "SO2 + PM spike at night near industrial zone",
		primaryPollutant: "SO2",
		icon: "factory",
	},
	{
		id: "crop-burning",
		type: "crop_burning",
		check: (data) =>
			data.pm10 > 100 &&
			data.pm10 > data.pm25 * 1.8 &&
			data.month >= 9 &&
			data.month <= 11,
		title: "Anomaly: Crop Burning Detected",
		description: "PM10:PM2.5 ratio suggests agricultural residue burning",
		primaryPollutant: "PM10",
		icon: "flame",
	},
	{
		id: "thermal-inversion",
		type: "thermal_inversion",
		check: (data) =>
			data.humidity > 80 &&
			data.temp < 15 &&
			data.windSpeed < 5 &&
			data.pm25 > 100,
		title: "Alert: Thermal Inversion Event",
		description: "Cold, humid, calm conditions trapping pollutants near ground",
		primaryPollutant: "PM2.5",
		icon: "thermometer",
	},
	{
		id: "construction-dust",
		type: "construction",
		check: (data) =>
			data.pm10 > 80 &&
			data.pm10 > data.pm25 * 1.5 &&
			data.hour >= 8 &&
			data.hour <= 18,
		title: "Anomaly: Construction Dust Event",
		description:
			"High coarse particle ratio during daytime suggests construction activity",
		primaryPollutant: "PM10",
		icon: "wind",
	},
	{
		id: "dust-storm",
		type: "dust_storm",
		check: (data) => data.pm25 > 150 && data.windSpeed > 30 && data.dust > 200,
		title: "Alert: Dust Storm Approaching",
		description:
			"High wind speeds carrying particulate matter from arid regions",
		primaryPollutant: "Dust",
		icon: "wind",
	},
];

function getSeverityColor(severity: ThreatAlert["severity"]): string {
	switch (severity) {
		case "critical":
			return "#dc2626";
		case "high":
			return "#f97316";
		case "medium":
			return "#eab308";
		case "low":
			return "#22c55e";
	}
}

function getSeverityLabel(severity: ThreatAlert["severity"]): string {
	switch (severity) {
		case "critical":
			return "CRITICAL";
		case "high":
			return "HIGH";
		case "medium":
			return "MEDIUM";
		case "low":
			return "LOW";
	}
}

function getIcon(iconName: string) {
	switch (iconName) {
		case "car":
			return <Car className="h-4 w-4" />;
		case "factory":
			return <Factory className="h-4 w-4" />;
		case "flame":
			return <Flame className="h-4 w-4" />;
		case "thermometer":
			return <Thermometer className="h-4 w-4" />;
		case "wind":
			return <Wind className="h-4 w-4" />;
		default:
			return <Zap className="h-4 w-4" />;
	}
}

function calculateSeverity(
	rule: ThreatRule,
	data: PollutantData,
): ThreatAlert["severity"] {
	const pollutantValue = data[
		rule.primaryPollutant.toLowerCase().replace("2", "") as keyof PollutantData
	] as number;
	if (!pollutantValue) return "low";
	if (pollutantValue > 150) return "critical";
	if (pollutantValue > 100) return "high";
	if (pollutantValue > 50) return "medium";
	return "low";
}

function calculateConfidence(rule: ThreatRule, data: PollutantData): number {
	let confidence = 70;
	const pollutantKey = rule.primaryPollutant
		.toLowerCase()
		.replace("2", "") as keyof PollutantData;
	const pollutant = data[pollutantKey] as number;

	if (pollutant > 100) confidence += 15;
	if (pollutant > 150) confidence += 10;
	if (rule.check(data)) confidence += 15;

	return Math.min(99, confidence);
}

export function ThreatAttribution() {
	const [isCollapsed, setIsCollapsed] = useState(true);
	const userLocation = useEnvStore((s) => s.userLocation);

	const { data: envSnapshot } = useTanstackQuery({
		queryKey: ["environmentalSnapshot", userLocation?.[0], userLocation?.[1]],
		queryFn: async () => {
			if (!userLocation) throw new Error("No location");
			return fetchEnvironmentalSnapshot({
				latitude: userLocation[1],
				longitude: userLocation[0],
				label: "Current",
			});
		},
		staleTime: 60 * 1000,
		refetchInterval: 60 * 1000,
		enabled: Boolean(userLocation),
	});

	const currentData: PollutantData = useMemo(() => {
		const now = new Date();
		return {
			pm25: envSnapshot?.pm25 ?? 45,
			pm10: envSnapshot?.pm10 ?? 75,
			no2: envSnapshot?.nitrogenDioxide ?? 25,
			o3: envSnapshot?.ozone ?? 35,
			so2: envSnapshot?.sulphurDioxide ?? 10,
			co: envSnapshot?.carbonMonoxide ?? 0.5,
			dust: envSnapshot?.dust ?? 30,
			hour: now.getHours(),
			month: now.getMonth() + 1,
			humidity: envSnapshot?.humidity ?? 60,
			temp: envSnapshot?.temperature ?? 25,
			windSpeed: envSnapshot?.windSpeed ?? 10,
		};
	}, [envSnapshot]);

	const detectedThreats = useMemo((): ThreatAlert[] => {
		const threats: ThreatAlert[] = [];
		const now = new Date();

		for (const rule of THREAT_RULES) {
			if (rule.check(currentData)) {
				const confidence = calculateConfidence(rule, currentData);
				const severity = calculateSeverity(rule, currentData);

				const hourLabel =
					now.getHours() < 12
						? `${now.getHours()}:00 AM`
						: `${now.getHours() === 12 ? 12 : now.getHours() - 12}:00 PM`;

				threats.push({
					id: rule.id,
					type: rule.type,
					title: rule.title,
					description: rule.description,
					confidence,
					severity,
					location: "Sector 4 - Industrial Zone",
					timeRange: hourLabel,
					primaryPollutant: rule.primaryPollutant,
					icon: rule.icon,
					timestamp: Date.now(),
				});
			}
		}

		return threats.sort((a, b) => {
			const severityOrder = { critical: 0, high: 1, medium: 2, low: 3 };
			return severityOrder[a.severity] - severityOrder[b.severity];
		});
	}, [currentData]);

	if (detectedThreats.length === 0) {
		if (isCollapsed) {
			return (
				<motion.button
					initial={{ opacity: 0, x: 20 }}
					animate={{ opacity: 1, x: 0 }}
					transition={{ duration: 0.3 }}
					type="button"
					onClick={() => setIsCollapsed(false)}
					className="pointer-events-auto absolute top-16 right-4 z-30 flex items-center gap-2 rounded-2xl border border-emerald-500/20 bg-black/95 px-3 py-2 shadow-2xl backdrop-blur-2xl transition-colors hover:bg-white/[0.03]"
				>
					<AlertTriangle className="h-3.5 w-3.5 text-emerald-400" />
					<span className="font-mono text-[10px] font-bold text-emerald-400">
						Threats
					</span>
					<div className="h-1.5 w-1.5 rounded-full bg-emerald-400" />
				</motion.button>
			);
		}
		return (
			<motion.div
				initial={{ opacity: 0, scale: 0.95 }}
				animate={{ opacity: 1, scale: 1 }}
				transition={{ duration: 0.4, ease: "easeOut" }}
				className="pointer-events-auto absolute top-16 right-4 z-30 w-72 rounded-2xl border border-emerald-500/20 bg-black/95 shadow-2xl backdrop-blur-2xl"
			>
				<div className="flex items-center justify-between border-b border-white/10 bg-gradient-to-r from-emerald-500/10 to-transparent px-4 py-3">
					<div className="flex items-center gap-2">
						<AlertTriangle className="h-4 w-4 text-emerald-400" />
						<h4 className="font-mono text-[11px] font-bold uppercase tracking-wider text-emerald-400">
							Threats
						</h4>
					</div>
					<button
						type="button"
						onClick={() => setIsCollapsed(true)}
						className="rounded-lg p-1 text-zinc-500 transition-colors hover:bg-white/10 hover:text-white"
					>
						<ChevronDown className="h-3.5 w-3.5 rotate-180" />
					</button>
				</div>

				<div className="flex flex-col items-center justify-center p-4 text-center">
					<div className="mb-2 flex h-10 w-10 items-center justify-center rounded-full bg-emerald-500/10">
						<Zap className="h-5 w-5 text-emerald-400" />
					</div>
					<p className="font-mono text-[10px] font-bold text-emerald-400">
						No Anomalies Detected
					</p>
					<p className="mt-1 font-mono text-[8px] text-zinc-500">
						All pollutant levels within expected patterns
					</p>
				</div>

				<div className="grid grid-cols-3 gap-1 border-t border-white/10 px-4 pb-3">
					<div className="rounded border border-white/5 bg-white/5 p-1.5 text-center">
						<p className="font-mono text-[6px] uppercase text-zinc-500">
							Pattern
						</p>
						<p className="font-mono text-[9px] font-bold text-emerald-400">
							Normal
						</p>
					</div>
					<div className="rounded border border-white/5 bg-white/5 p-1.5 text-center">
						<p className="font-mono text-[6px] uppercase text-zinc-500">
							Source
						</p>
						<p className="font-mono text-[9px] font-bold text-emerald-400">
							Mixed
						</p>
					</div>
					<div className="rounded border border-white/5 bg-white/5 p-1.5 text-center">
						<p className="font-mono text-[6px] uppercase text-zinc-500">
							Trend
						</p>
						<p className="font-mono text-[9px] font-bold text-emerald-400">
							Stable
						</p>
					</div>
				</div>
			</motion.div>
		);
	}

	if (isCollapsed) {
		const topThreat = detectedThreats[0];
		return (
			<motion.button
				initial={{ opacity: 0, x: 20 }}
				animate={{ opacity: 1, x: 0 }}
				transition={{ duration: 0.3 }}
				type="button"
				onClick={() => setIsCollapsed(false)}
				className="pointer-events-auto absolute top-16 right-4 z-30 flex items-center gap-2 rounded-2xl border bg-black/95 px-3 py-2 shadow-2xl backdrop-blur-2xl transition-colors hover:bg-white/[0.03]"
				style={{
					borderColor: `${getSeverityColor(topThreat.severity)}40`,
				}}
			>
				<AlertTriangle
					className="h-3.5 w-3.5"
					style={{ color: getSeverityColor(topThreat.severity) }}
				/>
				<span
					className="font-mono text-[10px] font-bold"
					style={{ color: getSeverityColor(topThreat.severity) }}
				>
					Threats {detectedThreats.length}
				</span>
				<div
					className="h-1.5 w-1.5 animate-pulse rounded-full"
					style={{ backgroundColor: getSeverityColor(topThreat.severity) }}
				/>
			</motion.button>
		);
	}

	return (
		<motion.div
			initial={{ opacity: 0, scale: 0.95 }}
			animate={{ opacity: 1, scale: 1 }}
			transition={{ duration: 0.4, ease: "easeOut" }}
			className="pointer-events-auto absolute top-16 right-4 z-30 w-80 rounded-2xl border border-amber-500/20 bg-black/95 shadow-2xl backdrop-blur-2xl"
		>
			<div className="flex items-center justify-between border-b border-white/10 bg-gradient-to-r from-amber-500/10 to-transparent px-4 py-3">
				<div className="flex items-center gap-2">
					<AlertTriangle className="h-4 w-4 text-amber-400" />
					<div>
						<h4 className="font-mono text-[11px] font-bold uppercase tracking-wider text-amber-400">
							Threats {detectedThreats.length}
						</h4>
						<p className="font-mono text-[8px] text-zinc-500">
							{detectedThreats.length} anomaly
							{detectedThreats.length !== 1 ? "s" : ""} detected
						</p>
					</div>
				</div>
				<div className="flex items-center gap-1">
					<div
						className="rounded px-2 py-0.5 font-mono text-[9px] font-bold"
						style={{
							backgroundColor: `${getSeverityColor(detectedThreats[0].severity)}20`,
							color: getSeverityColor(detectedThreats[0].severity),
						}}
					>
						{getSeverityLabel(detectedThreats[0].severity)}
					</div>
					<button
						type="button"
						onClick={() => setIsCollapsed(true)}
						className="rounded-lg p-1 text-zinc-500 transition-colors hover:bg-white/10 hover:text-white"
					>
						<ChevronDown className="h-3.5 w-3.5 rotate-180" />
					</button>
				</div>
			</div>

			<div className="max-h-[320px] space-y-2 overflow-y-auto p-4">
				{detectedThreats.map((threat) => (
					<motion.div
						key={threat.id}
						initial={{ opacity: 0, x: -20 }}
						animate={{ opacity: 1, x: 0 }}
						transition={{ duration: 0.3 }}
						className="rounded-lg border border-white/5 bg-white/5 p-3"
						style={{ borderColor: `${getSeverityColor(threat.severity)}30` }}
					>
						<div className="mb-1.5 flex items-start justify-between gap-2">
							<div className="flex items-center gap-2">
								<div
									className="flex h-7 w-7 items-center justify-center rounded-lg"
									style={{
										backgroundColor: `${getSeverityColor(threat.severity)}20`,
										color: getSeverityColor(threat.severity),
									}}
								>
									{getIcon(threat.icon)}
								</div>
								<div>
									<p className="font-mono text-[10px] font-bold text-white">
										{threat.title}
									</p>
									<div className="mt-0.5 flex items-center gap-2 font-mono text-[8px] text-zinc-500">
										<span className="flex items-center gap-1">
											<Clock className="h-2.5 w-2.5" />
											{threat.timeRange}
										</span>
										<span>-</span>
										<span>{threat.location}</span>
									</div>
								</div>
							</div>
							<div className="flex flex-col items-end">
								<span
									className="font-mono text-[9px] font-bold"
									style={{ color: getSeverityColor(threat.severity) }}
								>
									{threat.confidence}%
								</span>
								<span className="font-mono text-[7px] text-zinc-500">
									confidence
								</span>
							</div>
						</div>
						<p className="font-mono text-[9px] text-zinc-400">
							{threat.description}
						</p>
						<div className="mt-2 flex items-center gap-2">
							<span className="rounded border border-white/10 bg-white/5 px-1.5 py-0.5 font-mono text-[8px] text-zinc-400">
								{threat.primaryPollutant}
							</span>
							<span className="rounded border border-white/10 bg-white/5 px-1.5 py-0.5 font-mono text-[8px] text-zinc-400">
								{threat.type.replace("_", " ")}
							</span>
						</div>
					</motion.div>
				))}
			</div>

			<div className="border-t border-white/10 px-4 pb-4">
				<p className="font-mono text-[8px] uppercase tracking-wider text-zinc-500">
					Chemical Fingerprint
				</p>
				<div className="mt-1.5 flex gap-1">
					{[
						{ label: "PM2.5", value: currentData.pm25, max: 150 },
						{ label: "PM10", value: currentData.pm10, max: 250 },
						{ label: "NO2", value: currentData.no2, max: 100 },
						{ label: "SO2", value: currentData.so2, max: 80 },
						{ label: "O3", value: currentData.o3, max: 180 },
					].map((pollutant) => (
						<div key={pollutant.label} className="flex-1">
							<div className="mb-0.5 flex justify-between">
								<span className="font-mono text-[6px] text-zinc-500">
									{pollutant.label}
								</span>
								<span className="font-mono text-[6px] text-zinc-400">
									{Math.round(pollutant.value)}
								</span>
							</div>
							<div className="h-1 w-full overflow-hidden rounded-full bg-white/5">
								<div
									className="h-full rounded-full"
									style={{
										width: `${Math.min(100, (pollutant.value / pollutant.max) * 100)}%`,
										backgroundColor:
											pollutant.value / pollutant.max > 0.7
												? "#dc2626"
												: pollutant.value / pollutant.max > 0.4
													? "#eab308"
													: "#22c55e",
									}}
								/>
							</div>
						</div>
					))}
				</div>
			</div>
		</motion.div>
	);
}
