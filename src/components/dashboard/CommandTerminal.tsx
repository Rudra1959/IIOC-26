import { AnimatePresence, motion } from "framer-motion";
import { Copy, Send, Terminal, Trash2, X } from "lucide-react";
import { useCallback, useEffect, useRef, useState } from "react";
import { useFeatureStore } from "#/store/featureStore";

interface CommandTerminalProps {
	isOpen: boolean;
	onClose: () => void;
	onToggle: () => void;
}

interface TerminalLine {
	id: number;
	type: "command" | "output" | "error" | "success";
	content: string;
	timestamp: number;
}

interface CommandResult {
	type: "output" | "error" | "success";
	content: string;
}

const COMMAND_HELP = `
Available Commands:
  /simulate <policy> <value>  - Set intervention (0-100)
  /locate <pollutant>         - Find highest pollutant
  /alert <level>              - Set alert level
  /mode <citizen|gov>         - Switch mode
  /export <format>             - Export data (csv/json)
  /clear                       - Clear terminal
  /help                        - Show this help
  /status                      - Show current system status
  /forecast <hours>            - Get forecast for hours ahead
  /sensors                     - List all sensor readings
  /budget                      - Show city budget status
`.trim();

const POLICY_MAP: Record<string, string> = {
	heavy: "heavy-vehicles",
	vehicle: "heavy-vehicles",
	truck: "heavy-vehicles",
	construction: "construction",
	const: "construction",
	build: "construction",
	misting: "street-misting",
	street: "street-misting",
	water: "street-misting",
	industrial: "industrial-emissions",
	industry: "industrial-emissions",
	emissions: "industrial-emissions",
	factory: "industrial-emissions",
	transit: "public-transit",
	bus: "public-transit",
	metro: "public-transit",
	public: "public-transit",
	stagger: "staggered-hours",
	hours: "staggered-hours",
	work: "staggered-hours",
	flex: "staggered-hours",
};

const POLLUTANT_MAP: Record<string, string> = {
	pm25: "pm2.5",
	pm2: "pm2.5",
	fine: "pm2.5",
	particulate: "pm2.5",
	pm10: "pm10",
	coarse: "pm10",
	dust: "pm10",
	no2: "no2",
	nitrogen: "no2",
	dioxide: "no2",
	o3: "ozone",
	ozone: "ozone",
	so2: "so2",
	sulfur: "so2",
	sulphur: "so2",
	co: "co",
	carbon: "co",
	monoxide: "co",
};

let lineIdCounter = 0;

function parseCommand(input: string): CommandResult {
	const trimmed = input.trim();
	if (!trimmed.startsWith("/")) {
		return { type: "error", content: "Commands must start with /" };
	}

	const parts = trimmed.split(/\s+/);
	const cmd = parts[0].toLowerCase();
	const args = parts.slice(1);

	switch (cmd) {
		case "/help":
		case "/h":
		case "/?":
			return { type: "output", content: COMMAND_HELP };

		case "/clear":
		case "/cls":
			return { type: "output", content: "__CLEAR__" };

		case "/simulate":
		case "/sim":
		case "/policy": {
			if (args.length < 2) {
				return {
					type: "error",
					content:
						"Usage: /simulate <policy> <value>\nExample: /simulate heavy 50",
				};
			}
			const policyKey = args[0].toLowerCase();
			const policyId = POLICY_MAP[policyKey];
			if (!policyId) {
				const validPolicies = Object.keys(POLICY_MAP).join(", ");
				return {
					type: "error",
					content: `Unknown policy: ${args[0]}\nValid policies: ${validPolicies}`,
				};
			}
			const value = parseInt(args[1], 10);
			if (isNaN(value) || value < 0 || value > 100) {
				return { type: "error", content: "Value must be between 0 and 100" };
			}
			return {
				type: "success",
				content: `Setting ${policyId} to ${value}%\nProjected AQI updated. Check PolicySimulator panel.`,
			};
		}

		case "/locate":
		case "/find":
		case "/search": {
			if (args.length < 1) {
				return {
					type: "error",
					content: "Usage: /locate <pollutant>\nExample: /locate pm25",
				};
			}
			const pollutantKey = args[0].toLowerCase();
			const pollutantId = POLLUTANT_MAP[pollutantKey];
			if (!pollutantId) {
				const validPollutants = Object.keys(POLLUTANT_MAP).join(", ");
				return {
					type: "error",
					content: `Unknown pollutant: ${args[0]}\nValid pollutants: ${validPollutants}`,
				};
			}
			const locations = [
				"Sector 4 - Industrial Zone",
				"Highway NH-32",
				"City Center",
				"Residential Area A",
				"Peri-urban Zone",
			];
			const randomLocation =
				locations[Math.floor(Math.random() * locations.length)];
			return {
				type: "success",
				content: `Highest ${pollutantId} detected at:\n${randomLocation}\nPanning map to location...`,
			};
		}

		case "/alert":
		case "/warning": {
			if (args.length < 1) {
				return {
					type: "error",
					content:
						"Usage: /alert <level>\nLevels: green, yellow, orange, red, purple, maroon",
				};
			}
			const level = args[0].toLowerCase();
			const validLevels = [
				"green",
				"yellow",
				"orange",
				"red",
				"purple",
				"maroon",
			];
			if (!validLevels.includes(level)) {
				return {
					type: "error",
					content: `Invalid level: ${level}\nValid levels: ${validLevels.join(", ")}`,
				};
			}
			return {
				type: "success",
				content: `Alert level set to ${level.toUpperCase()}\nAll stations notified.`,
			};
		}

		case "/mode":
		case "/switch": {
			if (args.length < 1) {
				return {
					type: "error",
					content: "Usage: /mode <citizen|gov>\nExample: /mode gov",
				};
			}
			const mode = args[0].toLowerCase();
			if (mode !== "citizen" && mode !== "gov" && mode !== "government") {
				return {
					type: "error",
					content: "Mode must be 'citizen' or 'gov'",
				};
			}
			return {
				type: "success",
				content: `Switching to ${mode === "gov" ? "Government" : "Citizen"} mode...`,
			};
		}

		case "/export":
		case "/download": {
			if (args.length < 1) {
				return {
					type: "error",
					content: "Usage: /export <format>\nFormats: csv, json, pdf",
				};
			}
			const format = args[0].toLowerCase();
			if (!["csv", "json", "pdf"].includes(format)) {
				return {
					type: "error",
					content: "Format must be csv, json, or pdf",
				};
			}
			return {
				type: "success",
				content: `Generating ${format.toUpperCase()} export...\nDownload started.`,
			};
		}

		case "/status":
		case "/stat":
			return {
				type: "output",
				content: `AirSentinel OS v2.6.0
System Status: OPERATIONAL
Active Sensors: 24/24
Data Freshness: LIVE
Last Sync: Just now`,
			};

		case "/forecast":
		case "/weather": {
			const hours = args[0] ? parseInt(args[0], 10) : 24;
			if (isNaN(hours) || hours < 1 || hours > 72) {
				return {
					type: "error",
					content: "Hours must be between 1 and 72",
				};
			}
			const forecastedAqi = 75 + Math.round(Math.sin(hours / 24) * 30);
			return {
				type: "output",
				content: `Forecast for +${hours}h:
AQI: ${forecastedAqi}
Condition: ${forecastedAqi > 100 ? "Unhealthy" : forecastedAqi > 50 ? "Moderate" : "Good"}
Confidence: 78%`,
			};
		}

		case "/sensors":
		case "/readings":
			return {
				type: "output",
				content: `Sensor Network Status:
  CPCB Station 1: AQI 85 - GOOD
  CPCB Station 2: AQI 142 - MODERATE
  CPCB Station 3: AQI 78 - GOOD
  Industrial Monitor: AQI 195 - UNHEALTHY
  Traffic Zone: AQI 110 - MODERATE
  All 5 sensors operational`,
			};

		case "/budget":
		case "/funds":
			return {
				type: "output",
				content: `City Budget Status:
  Available: ₹10.00 Cr
  Deployed: ₹2.50 Cr
  Remaining: ₹7.50 Cr
  Daily Burn Rate: ₹50K/day`,
			};

		case "/reset":
		case "/restart":
			return {
				type: "success",
				content: "Resetting all interventions and simulations...",
			};

		default:
			return {
				type: "error",
				content: `Unknown command: ${cmd}\nType /help for available commands`,
			};
	}
}

export function CommandTerminal({
	isOpen,
	onClose,
	onToggle,
}: CommandTerminalProps) {
	const [lines, setLines] = useState<TerminalLine[]>([
		{
			id: lineIdCounter++,
			type: "output",
			content:
				"AirSentinel OS Command Terminal v2.6.0\nType /help for available commands",
			timestamp: Date.now(),
		},
	]);
	const [input, setInput] = useState("");
	const [history, setHistory] = useState<string[]>([]);
	const [historyIndex, setHistoryIndex] = useState(-1);

	const inputRef = useRef<HTMLInputElement>(null);
	const outputRef = useRef<HTMLDivElement>(null);

	const setMode = useFeatureStore((s) => s.setMode);

	const handleSubmit = useCallback(
		(e: React.FormEvent) => {
			e.preventDefault();
			const trimmedInput = input.trim();
			if (!trimmedInput) return;

			setLines((prev) => [
				...prev,
				{
					id: lineIdCounter++,
					type: "command",
					content: trimmedInput,
					timestamp: Date.now(),
				},
			]);

			setHistory((prev) => [trimmedInput, ...prev].slice(0, 50));
			setHistoryIndex(-1);

			const result = parseCommand(trimmedInput);

			if (result.type === "output" && result.content === "__CLEAR__") {
				setLines([]);
			} else {
				setLines((prev) => [
					...prev,
					{
						id: lineIdCounter++,
						type: result.type,
						content: result.content,
						timestamp: Date.now(),
					},
				]);
			}

			if (result.content.includes("Switching to")) {
				if (trimmedInput.includes("gov")) {
					setMode("government");
				} else {
					setMode("citizen");
				}
			}

			setInput("");

			setTimeout(() => {
				outputRef.current?.scrollTo({
					top: outputRef.current.scrollHeight,
					behavior: "smooth",
				});
			}, 50);
		},
		[input, setMode],
	);

	const handleKeyDown = useCallback(
		(e: React.KeyboardEvent<HTMLInputElement>) => {
			if (e.key === "ArrowUp") {
				e.preventDefault();
				if (historyIndex < history.length - 1) {
					const newIndex = historyIndex + 1;
					setHistoryIndex(newIndex);
					setInput(history[newIndex]);
				}
			} else if (e.key === "ArrowDown") {
				e.preventDefault();
				if (historyIndex > 0) {
					const newIndex = historyIndex - 1;
					setHistoryIndex(newIndex);
					setInput(history[newIndex]);
				} else if (historyIndex === 0) {
					setHistoryIndex(-1);
					setInput("");
				}
			} else if (e.key === "Escape") {
				onClose();
			}
		},
		[history, historyIndex, onClose],
	);

	const clearTerminal = useCallback(() => {
		setLines([
			{
				id: lineIdCounter++,
				type: "output",
				content: "Terminal cleared",
				timestamp: Date.now(),
			},
		]);
	}, []);

	const copyOutput = useCallback(() => {
		const output = lines
			.map((l) => `${l.type === "command" ? ">" : ""}${l.content}`)
			.join("\n");
		navigator.clipboard.writeText(output);
	}, [lines]);

	useEffect(() => {
		const handleGlobalKey = (e: KeyboardEvent) => {
			if (e.key === "`" || (e.ctrlKey && e.key === "`")) {
				e.preventDefault();
				onToggle();
			}
		};
		window.addEventListener("keydown", handleGlobalKey);
		return () => window.removeEventListener("keydown", handleGlobalKey);
	}, [onToggle]);

	useEffect(() => {
		if (isOpen && inputRef.current) {
			inputRef.current.focus();
		}
	}, [isOpen]);

	const getLineColor = (type: TerminalLine["type"]) => {
		switch (type) {
			case "command":
				return "text-cyan-400";
			case "output":
				return "text-zinc-300";
			case "error":
				return "text-red-400";
			case "success":
				return "text-emerald-400";
		}
	};

	return (
		<>
			<AnimatePresence>
				{isOpen && (
					<motion.div
						initial={{ opacity: 0, y: 20, scale: 0.95 }}
						animate={{ opacity: 1, y: 0, scale: 1 }}
						exit={{ opacity: 0, y: 20, scale: 0.95 }}
						transition={{ duration: 0.3, ease: [0.16, 1, 0.3, 1] }}
						className="pointer-events-auto absolute bottom-4 right-4 z-30 w-[480px] overflow-hidden rounded-2xl border border-indigo-500/30 bg-black/95 shadow-2xl backdrop-blur-2xl"
					>
						<div className="flex items-center justify-between border-b border-white/10 bg-gradient-to-r from-indigo-500/10 to-purple-500/10 px-4 py-2">
							<div className="flex items-center gap-2">
								<Terminal className="h-4 w-4 text-indigo-400" />
								<span className="font-mono text-[11px] font-bold uppercase tracking-widest text-indigo-400">
									Command Terminal
								</span>
								<span className="rounded bg-indigo-500/20 px-1.5 py-0.5 font-mono text-[8px] text-indigo-300">
									v2.6.0
								</span>
							</div>
							<div className="flex items-center gap-1">
								<button
									type="button"
									onClick={copyOutput}
									className="rounded p-1 text-zinc-500 transition-colors hover:bg-white/10 hover:text-white"
									title="Copy output"
								>
									<Copy className="h-3.5 w-3.5" />
								</button>
								<button
									type="button"
									onClick={clearTerminal}
									className="rounded p-1 text-zinc-500 transition-colors hover:bg-white/10 hover:text-white"
									title="Clear terminal"
								>
									<Trash2 className="h-3.5 w-3.5" />
								</button>
								<button
									type="button"
									onClick={onClose}
									className="rounded p-1 text-zinc-500 transition-colors hover:bg-white/10 hover:text-white"
									title="Close"
								>
									<X className="h-3.5 w-3.5" />
								</button>
							</div>
						</div>

						<div
							ref={outputRef}
							className="h-[280px] overflow-y-auto p-3 font-mono text-[11px] leading-relaxed"
						>
							{lines.map((line) => (
								<div
									key={line.id}
									className={`mb-1 ${getLineColor(line.type)}`}
								>
									{line.type === "command" && (
										<span className="mr-2 text-indigo-400">›</span>
									)}
									<pre className="whitespace-pre-wrap">{line.content}</pre>
								</div>
							))}
						</div>

						<form onSubmit={handleSubmit} className="border-t border-white/10">
							<div className="flex items-center gap-2 px-3 py-2">
								<span className="text-indigo-400">›</span>
								<input
									ref={inputRef}
									type="text"
									value={input}
									onChange={(e) => setInput(e.target.value)}
									onKeyDown={handleKeyDown}
									placeholder="Type a command (e.g., /help)"
									className="flex-1 bg-transparent font-mono text-[11px] text-white placeholder-zinc-600 outline-none"
								/>
								<button
									type="submit"
									disabled={!input.trim()}
									className="flex h-6 w-6 items-center justify-center rounded bg-indigo-500/20 text-indigo-400 transition-colors hover:bg-indigo-500/30 disabled:opacity-30"
								>
									<Send className="h-3 w-3" />
								</button>
							</div>
						</form>

						<div className="flex items-center justify-between border-t border-white/5 px-3 py-1.5 font-mono text-[8px] text-zinc-600">
							<div className="flex items-center gap-2">
								<span>Press</span>
								<kbd className="rounded bg-white/10 px-1 py-0.5">Esc</kbd>
								<span>to close</span>
							</div>
							<div className="flex items-center gap-2">
								<span>↑↓ for history</span>
							</div>
						</div>
					</motion.div>
				)}
			</AnimatePresence>
		</>
	);
}
