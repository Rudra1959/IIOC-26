import { useRouter, useSearch } from "@tanstack/react-router";
import { useDebouncedCallback } from "use-debounce";

interface SearchProps {
	readonly className?: string;
}

interface SearchState {
	page?: number;
	query?: string;
}

export function Search({ className = "" }: SearchProps) {
	const search = useSearch({ strict: false }) as SearchState;
	const router = useRouter();

	const handleSearch = useDebouncedCallback((term: string) => {
		router.navigate({
			to: ".",
			search: (prev) => ({
				...prev,
				page: 1,
				query: term || undefined,
			}),
			replace: true,
		});
	}, 300);

	return (
		<input
			type="text"
			placeholder="Search articles..."
			onChange={(event: React.ChangeEvent<HTMLInputElement>) => {
				handleSearch(event.target.value);
			}}
			defaultValue={search.query ?? ""}
			className={`w-full px-4 py-3 bg-slate-800 border border-slate-700 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:border-cyan-500 focus:ring-1 focus:ring-cyan-500 transition-colors ${className}`}
		/>
	);
}
