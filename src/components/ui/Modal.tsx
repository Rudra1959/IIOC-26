import { AnimatePresence, motion } from "framer-motion";
import { X } from "lucide-react";
import { type ReactNode, useEffect } from "react";
import { createPortal } from "react-dom";
import { useFeatureStore } from "#/store/featureStore";

interface ModalProps {
	id: string;
	title?: string;
	icon?: ReactNode;
	accentColor?: string;
	children: ReactNode;
	size?: "sm" | "md" | "lg" | "xl";
	onClose?: () => void;
}

const sizeClasses = {
	sm: "w-80 max-w-[90vw]",
	md: "w-[28rem] max-w-[90vw]",
	lg: "w-[36rem] max-w-[90vw]",
	xl: "w-[46rem] max-w-[95vw]",
};

export function Modal({
	id,
	title,
	icon,
	accentColor = "#f59e0b",
	children,
	size = "md",
	onClose,
}: ModalProps) {
	const openModals = useFeatureStore((s) => s.openModals);
	const isOpen = openModals.has(id as any);

	const handleClose = () => {
		onClose?.();
		useFeatureStore.getState().closeModal(id as any);
	};

	useEffect(() => {
		if (!isOpen) return;
		const handler = (e: KeyboardEvent) => {
			if (e.key === "Escape") useFeatureStore.getState().closeModal(id as any);
		};
		document.addEventListener("keydown", handler);
		return () => document.removeEventListener("keydown", handler);
	}, [isOpen, id]);

	if (typeof document === "undefined") return null;

	return createPortal(
		<AnimatePresence>
			{isOpen && (
				<div className="fixed inset-0 z-[60] flex items-center justify-center p-4">
					<motion.div
						key={`${id}-backdrop`}
						initial={{ opacity: 0 }}
						animate={{ opacity: 1 }}
						exit={{ opacity: 0 }}
						transition={{ duration: 0.2 }}
						className="absolute inset-0 bg-black/70 backdrop-blur-sm"
						onClick={handleClose}
					/>
					<motion.div
						key={`${id}-panel`}
						initial={{ opacity: 0, scale: 0.92, y: 20 }}
						animate={{ opacity: 1, scale: 1, y: 0 }}
						exit={{ opacity: 0, scale: 0.92, y: 20 }}
						transition={{ duration: 0.3, ease: [0.16, 1, 0.3, 1] }}
						className="relative w-full"
					>
						<div
							className={`overflow-y-auto rounded-2xl border border-white/10 bg-[#09090b]/95 shadow-2xl backdrop-blur-2xl ${sizeClasses[size]}`}
							style={{ maxHeight: "85vh" }}
						>
							{title && (
								<div
									className="sticky top-0 z-10 flex items-center justify-between border-b border-white/5 px-5 py-4 backdrop-blur-md"
									style={{ borderBottomColor: `${accentColor}20` }}
								>
									<div className="flex items-center gap-2.5">
										{icon && (
											<div
												className="flex h-8 w-8 items-center justify-center rounded-lg"
												style={{ backgroundColor: `${accentColor}20` }}
											>
												<div style={{ color: accentColor }}>{icon}</div>
											</div>
										)}
										<h2
											className="font-mono text-sm font-bold uppercase tracking-widest"
											style={{ color: accentColor }}
										>
											{title}
										</h2>
									</div>
									<button
										type="button"
										onClick={handleClose}
										className="flex h-7 w-7 items-center justify-center rounded-lg text-zinc-500 transition-colors hover:bg-white/10 hover:text-white"
									>
										<X className="h-4 w-4" />
									</button>
								</div>
							)}
							<div className="p-5">{children}</div>
						</div>
					</motion.div>
				</div>
			)}
		</AnimatePresence>,
		document.body,
	);
}
