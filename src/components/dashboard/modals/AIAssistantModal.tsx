import { useState } from "react";
import { Modal } from "#/components/ui/Modal";

const MESSAGES = [
	{
		id: "1",
		role: "assistant",
		content:
			"Welcome to AirSentinel AI Oracle. Ask me anything about air quality, health recommendations, or pollution trends in your area.",
	},
];

const SUGGESTIONS = [
	"What's the AQI forecast for today?",
	"How does PM2.5 affect my lungs?",
	"Best time to exercise outdoors?",
	"Compare Delhi vs Beijing air quality",
];

export function AIAssistantModal() {
	const [messages, setMessages] = useState(MESSAGES);
	const [input, setInput] = useState("");
	const [typing, setTyping] = useState(false);

	const handleSend = () => {
		if (!input.trim()) return;
		const userMsg = {
			id: Date.now().toString(),
			role: "user" as const,
			content: input.trim(),
		};
		setMessages((prev) => [...prev, userMsg]);
		setInput("");
		setTyping(true);
		setTimeout(() => {
			setTyping(false);
			setMessages((prev) => [
				...prev,
				{
					id: (Date.now() + 1).toString(),
					role: "assistant" as const,
					content: getAIResponse(input.trim()),
				},
			]);
		}, 1500);
	};

	return (
		<Modal
			id="aiAssistant"
			title="AI Assistant"
			icon={<span>🤖</span>}
			accentColor="#06b6d4"
			size="lg"
		>
			<div className="space-y-3">
				<div
					className="flex flex-col gap-2 rounded-xl border border-white/5 bg-white/[0.02] p-3"
					style={{ maxHeight: 280, overflowY: "auto" }}
				>
					{messages.map((m) => (
						<div
							key={m.id}
							className={`flex ${m.role === "user" ? "justify-end" : "justify-start"}`}
						>
							<div
								className={`max-w-[80%] rounded-2xl px-3 py-2 font-mono text-[10px] leading-relaxed ${
									m.role === "user"
										? "bg-cyan-500/20 text-cyan-200"
										: "border border-white/5 bg-white/[0.03] text-zinc-300"
								}`}
							>
								{m.content}
							</div>
						</div>
					))}
					{typing && (
						<div className="flex justify-start">
							<div className="rounded-2xl border border-white/5 bg-white/[0.03] px-3 py-2 font-mono text-[10px] text-zinc-500">
								Thinking...
							</div>
						</div>
					)}
				</div>

				<div className="flex flex-wrap gap-1">
					{SUGGESTIONS.map((s) => (
						<button
							key={s}
							type="button"
							onClick={() => {
								setInput(s);
							}}
							className="rounded-lg border border-white/5 bg-white/[0.02] px-2 py-1 font-mono text-[8px] text-zinc-400 transition-colors hover:border-cyan-500/30 hover:text-cyan-400"
						>
							{s.length > 30 ? s.slice(0, 28) + "..." : s}
						</button>
					))}
				</div>

				<div className="flex gap-2">
					<input
						type="text"
						value={input}
						onChange={(e) => setInput(e.target.value)}
						onKeyDown={(e) => e.key === "Enter" && handleSend()}
						placeholder="Ask about air quality..."
						className="flex-1 rounded-lg border border-white/10 bg-white/5 px-3 py-2 font-mono text-[10px] text-white placeholder:text-zinc-600 focus:border-cyan-500/50 focus:outline-none"
					/>
					<button
						type="button"
						onClick={handleSend}
						className="rounded-lg bg-cyan-500/20 px-4 py-2 font-mono text-[10px] font-bold text-cyan-400 transition-colors hover:bg-cyan-500/30"
					>
						SEND
					</button>
				</div>

				<div className="grid grid-cols-2 gap-2">
					{[
						{ label: "Model", value: "AQ-GPT-4", color: "#06b6d4" },
						{ label: "Context", value: "72hr window", color: "#8b5cf6" },
						{ label: "Sources", value: "12 stations", color: "#22c55e" },
						{ label: "Confidence", value: "94.2%", color: "#eab308" },
					].map((s) => (
						<div
							key={s.label}
							className="flex items-center justify-between rounded-lg border border-white/5 bg-white/[0.02] px-2 py-1.5"
						>
							<span className="font-mono text-[8px] uppercase text-zinc-500">
								{s.label}
							</span>
							<span
								className="font-mono text-[9px] font-bold"
								style={{ color: s.color }}
							>
								{s.value}
							</span>
						</div>
					))}
				</div>
			</div>
		</Modal>
	);
}

function getAIResponse(query: string): string {
	const q = query.toLowerCase();
	if (q.includes("aqi") && q.includes("forecast")) {
		return "Today's AQI is 142 (Unhealthy for Sensitive Groups). Peak pollution expected between 7-9 AM and 6-9 PM. Wind direction shifts to NW after 2 PM, which should improve air quality in central areas by ~25 AQI points.";
	}
	if (q.includes("pm2.5") || q.includes("lung")) {
		return "PM2.5 particles (diameter <2.5μm) can penetrate deep into lung tissue and enter the bloodstream. At current levels (58 μg/m³), prolonged exposure may cause 12-18% reduction in lung function over time. Wearing an N95 mask reduces exposure by ~85%.";
	}
	if (q.includes("exercise") || q.includes("outdoor")) {
		return "Based on current pollution patterns, the best window for outdoor exercise is 11 AM - 2 PM (AQI drops to ~95). Avoid early morning (6-9 AM) when temperature inversions trap pollutants near ground level.";
	}
	if (q.includes("compare") || q.includes("delhi") || q.includes("beijing")) {
		return "Delhi AQI: 312 (Very Unhealthy) | Beijing AQI: 98 (Moderate). Delhi's pollution is 3.2x worse. Key difference: Beijing's aggressive EV mandates and factory relocation have cut PM2.5 by 53% since 2017. Delhi's vehicle population grew 18% in the same period.";
	}
	return "I can help with AQI forecasts, health impacts, outdoor activity recommendations, and pollution comparisons. Try asking about today's air quality, exercise timing, or specific pollutant effects.";
}
