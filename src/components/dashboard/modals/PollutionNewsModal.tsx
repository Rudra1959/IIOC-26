import { useState } from "react";
import { Modal } from "#/components/ui/Modal";

const NEWS = [
	{
		title: "Steel Plant Fails Emission Norms Again",
		source: "Times of India",
		tag: "Local",
		sentiment: -0.8,
		relevance: 0.95,
		daysAgo: 0,
	},
	{
		title: "GRAP IV Restrictions Extended in Delhi NCR",
		source: "The Hindu",
		tag: "Policy",
		sentiment: 0.2,
		relevance: 0.88,
		daysAgo: 1,
	},
	{
		title: "PM2.5 Linked to Cognitive Decline in New Study",
		source: "The Lancet",
		tag: "Science",
		sentiment: -0.6,
		relevance: 0.92,
		daysAgo: 2,
	},
	{
		title: "India's Clean Energy Transition Accelerates",
		source: "Reuters",
		tag: "Policy",
		sentiment: 0.7,
		relevance: 0.75,
		daysAgo: 3,
	},
	{
		title: "Bokaro Hospital Reports Surge in Respiratory Cases",
		source: "NDTV",
		tag: "Local",
		sentiment: -0.9,
		relevance: 0.98,
		daysAgo: 0,
	},
];

const TAGS = ["All", "Local", "Policy", "Science"];

export function PollutionNewsModal() {
	const [activeTag, setActiveTag] = useState("All");
	const [sentiment30, setSentiment30] = useState([
		0.1, -0.2, -0.4, -0.3, -0.1, 0.2, 0.1, -0.3, -0.5, -0.2, 0.0, 0.3, -0.1,
		-0.4, -0.2, 0.1, 0.3, -0.1, -0.3, -0.2, 0.0, 0.2, -0.1, 0.1, -0.2, 0.3,
		-0.1, 0.2, -0.3, 0.0,
	]);

	const filtered =
		activeTag === "All" ? NEWS : NEWS.filter((n) => n.tag === activeTag);

	return (
		<Modal
			id="pollutionNews"
			title="Pollution News"
			icon={<span>📰</span>}
			accentColor="#e879f9"
			size="lg"
		>
			<div className="space-y-4">
				<div className="flex gap-1">
					{TAGS.map((tag) => (
						<button
							key={tag}
							type="button"
							onClick={() => setActiveTag(tag)}
							className={`rounded-full border px-3 py-1 font-mono text-[10px] font-bold uppercase transition-colors ${
								activeTag === tag
									? "border-pink-500/50 bg-pink-500/10 text-pink-300"
									: "border-white/10 bg-white/[0.02] text-zinc-500 hover:border-white/20"
							}`}
						>
							{tag}
						</button>
					))}
				</div>

				<div className="space-y-2">
					{filtered.map((article, i) => (
						<div
							key={i}
							className="rounded-xl border border-white/5 bg-white/[0.02] p-3"
						>
							<div className="mb-1 flex items-center gap-2">
								<span
									className={`rounded px-1.5 py-0.5 font-mono text-[8px] font-bold uppercase ${
										article.tag === "Local"
											? "bg-red-500/20 text-red-400"
											: article.tag === "Policy"
												? "bg-blue-500/20 text-blue-400"
												: "bg-purple-500/20 text-purple-400"
									}`}
								>
									{article.tag}
								</span>
								<span className="font-mono text-[9px] text-zinc-600">
									{article.source}
								</span>
								<span className="ml-auto font-mono text-[9px] text-zinc-600">
									{article.daysAgo === 0 ? "Today" : `${article.daysAgo}d ago`}
								</span>
							</div>
							<p className="font-mono text-[11px] font-bold text-white">
								{article.title}
							</p>
							<div className="mt-1.5 flex items-center gap-3">
								<div className="flex items-center gap-1">
									<span className="font-mono text-[9px] text-zinc-600">
										Sentiment:
									</span>
									<span
										className="font-mono text-[10px] font-bold"
										style={{
											color: article.sentiment > 0 ? "#22c55e" : "#dc2626",
										}}
									>
										{article.sentiment > 0 ? "+" : ""}
										{article.sentiment.toFixed(1)}
									</span>
								</div>
								<div className="flex items-center gap-1">
									<span className="font-mono text-[9px] text-zinc-600">
										Relevance:
									</span>
									<span className="font-mono text-[10px] font-bold text-white">
										{Math.round(article.relevance * 100)}%
									</span>
								</div>
							</div>
						</div>
					))}
				</div>

				<div className="space-y-1">
					<p className="font-mono text-[9px] uppercase tracking-widest text-zinc-500">
						30-Day Sentiment Tracker
					</p>
					<svg viewBox="0 0 300 40" className="w-full">
						<line
							x1="0"
							y1="20"
							x2="300"
							y2="20"
							stroke="#27272a"
							strokeWidth="0.5"
						/>
						<path
							d={
								"M0,20 " +
								sentiment30
									.map((v, i) => `L${i * (300 / 29)},${20 - v * 15}`)
									.join(" ")
							}
							fill="none"
							stroke="#e879f9"
							strokeWidth="1.5"
						/>
					</svg>
					<div className="flex justify-between font-mono text-[8px] text-zinc-600">
						<span>30d ago</span>
						<span className="text-pink-400">Overall: Slightly Negative</span>
						<span>Today</span>
					</div>
				</div>

				<div className="space-y-1">
					<p className="font-mono text-[9px] uppercase tracking-widest text-zinc-500">
						Trending Topics
					</p>
					<div className="flex flex-wrap gap-1">
						{[
							"Steel Plant",
							"GRAP IV",
							"Respiratory",
							"Clean Energy",
							"PM2.5 Study",
							"Hospital Surge",
						].map((topic, i) => (
							<span
								key={topic}
								className="rounded-full border border-white/5 bg-white/[0.02] px-2 py-1 font-mono text-[9px] text-zinc-400"
							>
								#{topic} {i < 2 && <span className="text-pink-400">🔥</span>}
							</span>
						))}
					</div>
				</div>
			</div>
		</Modal>
	);
}
