import { useState } from "react";
import { Modal } from "#/components/ui/Modal";

const REPORTS = [
	{
		id: 1,
		location: "Sector 5, Bokaro",
		severity: 8,
		type: "Factory Emission",
		status: "sent",
		time: "10 min ago",
	},
	{
		id: 2,
		location: "NH-32 Highway",
		severity: 5,
		type: "Road Dust",
		status: "pending",
		time: "25 min ago",
	},
	{
		id: 3,
		location: "Bokaro Steel Plant",
		severity: 9,
		type: "Stack Flare",
		status: "acknowledged",
		time: "1 hr ago",
	},
];

const PIPELINE = ["Submitted", "Validated", "Forwarded", "Actioned"];

export function CitizenReportModal() {
	const [severity, setSeverity] = useState(5);
	const [category, setCategory] = useState("factory");
	const [location, setLocation] = useState("Auto-detected: Bokaro Steel City");
	const [submitted, setSubmitted] = useState(false);
	const [reports, setReports] = useState(REPORTS);

	const handleSubmit = () => {
		setReports((prev) => [
			{
				id: Date.now(),
				location,
				severity,
				type: category.replace("-", " "),
				status: "sent",
				time: "Just now",
			},
			...prev,
		]);
		setSubmitted(true);
		setTimeout(() => setSubmitted(false), 2000);
	};

	const statusColor = (status: string) => {
		if (status === "acknowledged") return "#22c55e";
		if (status === "pending") return "#eab308";
		return "#38bdf8";
	};

	return (
		<Modal
			id="citizenReport"
			title="Citizen Report"
			icon={<span>📡</span>}
			accentColor="#f59e0b"
			size="lg"
		>
			<div className="space-y-4">
				<div className="space-y-3 rounded-xl border border-amber-500/20 bg-amber-500/5 p-4">
					<p className="font-mono text-[10px] uppercase tracking-widest text-amber-400">
						New Report
					</p>

					<div>
						<label className="mb-1 block font-mono text-[9px] text-zinc-500">
							Location
						</label>
						<input
							type="text"
							value={location}
							onChange={(e) => setLocation(e.target.value)}
							className="w-full rounded-lg border border-white/10 bg-black/40 px-3 py-2 font-mono text-[11px] text-white focus:border-amber-500/50 focus:outline-none"
						/>
					</div>

					<div>
						<label className="mb-1 block font-mono text-[9px] text-zinc-500">
							Category
						</label>
						<div className="grid grid-cols-2 gap-1">
							{[
								"factory",
								"vehicle",
								"construction",
								"biomass",
								"road-dust",
								"other",
							].map((cat) => (
								<button
									key={cat}
									type="button"
									onClick={() => setCategory(cat)}
									className={`rounded border px-2 py-1.5 font-mono text-[9px] font-bold capitalize transition-colors ${
										category === cat
											? "border-amber-500/50 bg-amber-500/10 text-amber-300"
											: "border-white/5 bg-white/[0.02] text-zinc-500 hover:border-white/10"
									}`}
								>
									{cat.replace("-", " ")}
								</button>
							))}
						</div>
					</div>

					<div>
						<div className="mb-1 flex items-center justify-between">
							<label className="font-mono text-[9px] text-zinc-500">
								Severity: {severity}/10
							</label>
							<span
								className="font-mono text-[10px] font-bold"
								style={{
									color:
										severity > 7
											? "#dc2626"
											: severity > 4
												? "#eab308"
												: "#22c55e",
								}}
							>
								{severity > 7 ? "Critical" : severity > 4 ? "Moderate" : "Low"}
							</span>
						</div>
						<input
							type="range"
							min="1"
							max="10"
							value={severity}
							onChange={(e) => setSeverity(Number(e.target.value))}
							className="h-2 w-full cursor-pointer appearance-none rounded-full accent-amber-500"
						/>
					</div>

					<button
						type="button"
						onClick={handleSubmit}
						className="w-full rounded-xl bg-gradient-to-r from-amber-500 to-orange-500 py-2.5 font-mono text-[11px] font-bold uppercase tracking-widest text-white shadow-lg shadow-amber-500/30 transition-all hover:from-amber-400 hover:to-orange-400"
					>
						{submitted ? "✓ Report Submitted" : "Submit Report"}
					</button>
				</div>

				<div className="space-y-1.5">
					<p className="font-mono text-[9px] uppercase tracking-widest text-zinc-500">
						Community Reports
					</p>
					{reports.map((r) => (
						<div
							key={r.id}
							className="rounded-lg border border-white/5 bg-white/[0.02] p-3"
						>
							<div className="mb-1 flex items-center justify-between">
								<span className="font-mono text-[11px] font-bold text-white">
									{r.type}
								</span>
								<span
									className="rounded border px-1.5 py-0.5 font-mono text-[9px] font-bold"
									style={{
										color: statusColor(r.status),
										borderColor: `${statusColor(r.status)}40`,
									}}
								>
									{r.status}
								</span>
							</div>
							<p className="font-mono text-[10px] text-zinc-500">
								{r.location}
							</p>
							<div className="mt-2 flex items-center gap-2">
								<div className="h-1 flex-1 overflow-hidden rounded-full bg-white/5">
									<div
										className="h-full rounded-full"
										style={{
											width: `${r.severity * 10}%`,
											backgroundColor:
												r.severity > 7
													? "#dc2626"
													: r.severity > 4
														? "#eab308"
														: "#22c55e",
										}}
									/>
								</div>
								<span className="font-mono text-[9px] text-zinc-600">
									{r.time}
								</span>
							</div>
						</div>
					))}
				</div>

				<div className="space-y-1">
					<p className="font-mono text-[9px] uppercase tracking-widest text-zinc-500">
						Report → Authority Pipeline
					</p>
					<div className="flex items-center gap-1">
						{PIPELINE.map((step, i) => (
							<div key={step} className="flex flex-1 items-center gap-0">
								<div
									className={`flex h-8 flex-1 items-center justify-center rounded border px-1 ${i < PIPELINE.length - 1 ? "border-r-0 rounded-r-none" : "rounded-l-none border-l-0"} ${i === 0 ? "rounded-l-lg border-l" : ""}`}
									style={{
										borderColor: "#22c55e40",
										backgroundColor: "#22c55e08",
									}}
								>
									<span className="font-mono text-[8px] text-emerald-400">
										{step}
									</span>
								</div>
								{i < PIPELINE.length - 1 && (
									<span className="text-zinc-700">→</span>
								)}
							</div>
						))}
					</div>
				</div>

				<div className="rounded-lg border border-white/5 bg-white/[0.02] p-3">
					<p className="font-mono text-[9px] uppercase tracking-widest text-zinc-500">
						Community Heatmap (Mock)
					</p>
					<svg viewBox="0 0 200 100" className="mt-2 w-full">
						{[...Array(40)].map((_, i) => {
							const x = (i % 8) * 25;
							const y = Math.floor(i / 8) * 25;
							const intensity = Math.random();
							const color =
								intensity > 0.7
									? "#dc2626"
									: intensity > 0.4
										? "#eab308"
										: "#22c55e";
							return (
								<rect
									key={i}
									x={x + 2}
									y={y + 2}
									width={20}
									height={20}
									rx={2}
									fill={color}
									fillOpacity={0.15 + intensity * 0.3}
								/>
							);
						})}
					</svg>
				</div>
			</div>
		</Modal>
	);
}
