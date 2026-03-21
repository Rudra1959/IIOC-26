import { useEnvStore } from "#/store/envStore";

export type ZoomContext = "city" | "neighborhood" | "micro";

export function useZoomContext(): ZoomContext {
	const mapZoom = useEnvStore((s) => s.mapZoom);

	if (mapZoom < 11) return "city";
	if (mapZoom < 13.5) return "neighborhood";
	return "micro";
}
