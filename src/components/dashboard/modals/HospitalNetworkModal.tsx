import { Modal } from "#/components/ui/Modal";

const HOSPITALS = [
	{
		name: "Bokaro General Hospital",
		beds: 240,
		icuFree: 4,
		icuTotal: 12,
		asthma: 8,
		bronchitis: 12,
		cardiac: 15,
		phone: "+91 6542 234567",
	},
	{
		name: "ESI Hospital",
		beds: 180,
		icuFree: 2,
		icuTotal: 8,
		asthma: 5,
		bronchitis: 8,
		cardiac: 9,
		phone: "+91 6542 345678",
	},
	{
		name: "City Medical Center",
		beds: 120,
		icuFree: 3,
		icuTotal: 6,
		asthma: 4,
		bronchitis: 6,
		cardiac: 7,
		phone: "+91 6542 456789",
	},
	{
		name: "Sanjay Gandhi Hospital",
		beds: 320,
		icuFree: 6,
		icuTotal: 16,
		asthma: 12,
		bronchitis: 18,
		cardiac: 22,
		phone: "+91 6542 567890",
	},
];

export function HospitalNetworkModal() {
	const totalIcuFree = HOSPITALS.reduce((sum, h) => sum + h.icuFree, 0);
	const totalIcu = HOSPITALS.reduce((sum, h) => sum + h.icuTotal, 0);
	const totalAdmissions = HOSPITALS.reduce(
		(sum, h) => sum + h.asthma + h.bronchitis + h.cardiac,
		0,
	);

	return (
		<Modal
			id="hospitalNetwork"
			title="Hospital Network"
			icon={<span>🏥</span>}
			accentColor="#f43f5e"
			size="xl"
		>
			<div className="space-y-4">
				<div className="grid grid-cols-3 gap-2">
					<div className="rounded-lg border border-red-500/20 bg-red-500/5 p-3 text-center">
						<p className="font-mono text-[8px] uppercase tracking-widest text-red-400/60">
							ICU Available
						</p>
						<p className="font-mono text-xl font-black text-red-400">
							{totalIcuFree}
							<span className="text-xs text-zinc-500">/{totalIcu}</span>
						</p>
					</div>
					<div className="rounded-lg border border-white/5 bg-white/[0.03] p-3 text-center">
						<p className="font-mono text-[8px] uppercase tracking-widest text-zinc-500">
							Total Beds
						</p>
						<p className="font-mono text-xl font-black text-white">
							{HOSPITALS.reduce((s, h) => s + h.beds, 0)}
						</p>
					</div>
					<div className="rounded-lg border border-orange-500/20 bg-orange-500/5 p-3 text-center">
						<p className="font-mono text-[8px] uppercase tracking-widest text-orange-400/60">
							Admissions Today
						</p>
						<p className="font-mono text-xl font-black text-orange-400">
							{totalAdmissions}
						</p>
					</div>
				</div>

				<div className="space-y-2">
					{HOSPITALS.map((h) => {
						const icuPct = Math.round((h.icuFree / h.icuTotal) * 100);
						const icuColor =
							icuPct > 50 ? "#22c55e" : icuPct > 25 ? "#eab308" : "#dc2626";
						return (
							<div
								key={h.name}
								className="rounded-xl border border-white/5 bg-white/[0.02] p-4"
							>
								<div className="mb-2 flex items-center justify-between">
									<p className="font-mono text-[11px] font-bold text-white">
										{h.name}
									</p>
									<span
										className="rounded border px-2 py-0.5 font-mono text-[9px] font-bold"
										style={{ borderColor: `${icuColor}40`, color: icuColor }}
									>
										{h.icuFree}/{h.icuTotal} ICU Free
									</span>
								</div>

								<div className="mb-2 h-2 w-full overflow-hidden rounded-full bg-white/5">
									<div
										className="h-full rounded-full transition-all"
										style={{ width: `${icuPct}%`, backgroundColor: icuColor }}
									/>
								</div>

								<div className="grid grid-cols-3 gap-2">
									<div className="rounded bg-blue-500/10 p-2 text-center">
										<p className="font-mono text-[8px] text-blue-400/60">
											Asthma
										</p>
										<p className="font-mono text-sm font-black text-blue-400">
											{h.asthma}
										</p>
									</div>
									<div className="rounded bg-yellow-500/10 p-2 text-center">
										<p className="font-mono text-[8px] text-yellow-400/60">
											Bronchitis
										</p>
										<p className="font-mono text-sm font-black text-yellow-400">
											{h.bronchitis}
										</p>
									</div>
									<div className="rounded bg-red-500/10 p-2 text-center">
										<p className="font-mono text-[8px] text-red-400/60">
											Cardiac
										</p>
										<p className="font-mono text-sm font-black text-red-400">
											{h.cardiac}
										</p>
									</div>
								</div>

								<div className="mt-2 flex items-center justify-between">
									<span className="font-mono text-[9px] text-zinc-600">
										📞 {h.phone}
									</span>
									<a
										href={`tel:${h.phone}`}
										className="rounded border border-red-500/30 bg-red-500/10 px-2 py-0.5 font-mono text-[9px] font-bold text-red-400 transition-colors hover:bg-red-500/20"
									>
										Call
									</a>
								</div>
							</div>
						);
					})}
				</div>

				<div className="rounded-lg border border-white/5 bg-white/[0.03] p-3">
					<p className="mb-2 font-mono text-[9px] uppercase tracking-widest text-zinc-500">
						30-Day AQI vs Admissions
					</p>
					<svg viewBox="0 0 300 80" className="w-full">
						{[0, 20, 40, 60, 80].map((y) => (
							<line
								key={y}
								x1="0"
								y1={y}
								x2="300"
								y2={y}
								stroke="#27272a"
								strokeWidth="0.5"
							/>
						))}
						<path
							d="M0 70 L30 68 L60 65 L90 60 L120 55 L150 50 L180 45 L210 40 L240 38 L270 36 L300 35"
							fill="none"
							stroke="#f97316"
							strokeWidth="2"
							strokeOpacity="0.7"
						/>
						<path
							d="M0 70 L30 68 L60 65 L90 60 L120 55 L150 52 L180 48 L210 44 L240 42 L270 40 L300 38"
							fill="none"
							stroke="#dc2626"
							strokeWidth="2"
							strokeDasharray="4 2"
						/>
						<text
							x="5"
							y="12"
							className="fill-zinc-500"
							fontSize="7"
							fontFamily="monospace"
						>
							Orange: AQI | Red: Admissions
						</text>
					</svg>
				</div>
			</div>
		</Modal>
	);
}
