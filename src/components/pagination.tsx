import { useRouter, useSearch } from "@tanstack/react-router";
import { ChevronLeft, ChevronRight } from "lucide-react";

interface PaginationProps {
	pageCount: number;
	className?: string;
}

interface PaginationSearchState {
	page?: number | string;
}

export function Pagination({ pageCount, className = "" }: PaginationProps) {
	const router = useRouter();
	const search = useSearch({ strict: false }) as PaginationSearchState;
	const currentPage = Number(search.page) || 1;

	const handlePageChange = (page: number) => {
		router.navigate({
			to: ".",
			search: (prev) => ({ ...prev, page }),
			replace: true,
		});
	};

	const getPageNumbers = () => {
		const pages: Array<number | "ellipsis-left" | "ellipsis-right"> = [];
		const showEllipsis = pageCount > 7;

		if (showEllipsis) {
			pages.push(1);

			if (currentPage > 3) {
				pages.push("ellipsis-left");
			}

			const start = Math.max(2, currentPage - 1);
			const end = Math.min(pageCount - 1, currentPage + 1);

			for (let page = start; page <= end; page++) {
				pages.push(page);
			}

			if (currentPage < pageCount - 2) {
				pages.push("ellipsis-right");
			}

			if (pageCount > 1) {
				pages.push(pageCount);
			}
		} else {
			for (let page = 1; page <= pageCount; page++) {
				pages.push(page);
			}
		}

		return pages;
	};

	const pageNumbers = getPageNumbers();

	if (pageCount <= 1) return null;

	return (
		<nav className={`flex items-center justify-center gap-1 ${className}`}>
			<button
				type="button"
				onClick={() => currentPage > 1 && handlePageChange(currentPage - 1)}
				disabled={currentPage <= 1}
				className={`flex items-center gap-1 px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
					currentPage <= 1
						? "text-gray-600 cursor-not-allowed"
						: "text-gray-300 hover:bg-slate-700 hover:text-white"
				}`}
			>
				<ChevronLeft className="w-4 h-4" />
				<span className="hidden sm:inline">Previous</span>
			</button>

			<div className="flex items-center gap-1">
				{pageNumbers.map((page) =>
					typeof page === "string" ? (
						<span
							key={page}
							className="hidden px-2 py-2 text-gray-500 md:block"
						>
							...
						</span>
					) : (
						<button
							type="button"
							key={page}
							onClick={() => handlePageChange(page)}
							className={`min-w-[40px] px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
								currentPage === page
									? "bg-cyan-500 text-white"
									: "text-gray-300 hover:bg-slate-700 hover:text-white"
							}`}
						>
							{page}
						</button>
					),
				)}
			</div>

			<button
				type="button"
				onClick={() =>
					currentPage < pageCount && handlePageChange(currentPage + 1)
				}
				disabled={currentPage >= pageCount}
				className={`flex items-center gap-1 px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
					currentPage >= pageCount
						? "text-gray-600 cursor-not-allowed"
						: "text-gray-300 hover:bg-slate-700 hover:text-white"
				}`}
			>
				<span className="hidden sm:inline">Next</span>
				<ChevronRight className="w-4 h-4" />
			</button>
		</nav>
	);
}
