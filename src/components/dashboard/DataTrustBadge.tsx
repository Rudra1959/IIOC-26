import { Clock, Satellite, Signal } from "lucide-react";
import { useEffect, useState } from "react";
import { useEnvStore } from "#/store/envStore";

export function DataTrustBadge() {
	const lastUpdated = useEnvStore((s) => s.lastUpdated);
	const [timeAgo, setTimeAgo] = useState("Just now");

	useEffect(() => {
		if (!lastUpdated) {
			setTimeAgo("Just now");
			return;
		}

		const updateTime = () => {
			const seconds = Math.floor((Date.now() - lastUpdated) / 1000);
			if (seconds < 60) {
				setTimeAgo(`${seconds}s ago`);
			} else if (seconds < 3600) {
				setTimeAgo(`${Math.floor(seconds / 60)}m ago`);
			} else {
				setTimeAgo(`${Math.floor(seconds / 3600)}h ago`);
			}
		};

		updateTime();
		const interval = setInterval(updateTime, 30000);
		return () => clearInterval(interval);
	}, [lastUpdated]);

	const stations = 12;
	const confidence = 94;

	return (
		<div className="pointer-events-auto flex items-center gap-3 rounded-xl border border-white/10 bg-black/60 px-3 py-1.5 backdrop-blur-md">
			<div className="flex items-center gap-1.5">
				<Clock className="h-3 w-3 text-zinc-500" />
				<span className="font-mono text-[9px] text-zinc-400">{timeAgo}</span>
			</div>
			<div className="h-3 w-px bg-white/10" />
			<div className="flex items-center gap-1.5">
				<Satellite className="h-3 w-3 text-zinc-500" />
				<span className="font-mono text-[9px] text-zinc-400">
					{stations} stations
				</span>
			</div>
			<div className="h-3 w-px bg-white/10" />
			<div className="flex items-center gap-1.5">
				<Signal className="h-3 w-3 text-emerald-500" />
				<span className="font-mono text-[9px] text-emerald-400">
					{confidence}%
				</span>
			</div>
		</div>
	);
}
