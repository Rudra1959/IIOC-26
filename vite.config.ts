import tailwindcss from "@tailwindcss/vite";
import { tanstackStart } from "@tanstack/react-start/plugin/vite";
import viteReact from "@vitejs/plugin-react";
import { defineConfig } from "vite";
import tsconfigPaths from "vite-tsconfig-paths";

const config = defineConfig({
	build: {
		rollupOptions: {
			output: {
				manualChunks(id) {
					if (id.includes("node_modules/maplibre-gl")) {
						return "maplibre";
					}

					if (
						id.includes("node_modules/@deck.gl") ||
						id.includes("node_modules/deck.gl") ||
						id.includes("node_modules/@loaders.gl") ||
						id.includes("node_modules/luma.gl") ||
						id.includes("node_modules/react-map-gl")
					) {
						return "deck-vendor";
					}

					if (id.includes("node_modules/framer-motion")) {
						return "motion";
					}
				},
			},
		},
	},
	plugins: [
		tsconfigPaths({ projects: ["./tsconfig.json"] }),
		tailwindcss(),
		tanstackStart({ spa: { enabled: true } }),
		viteReact({
			babel: {
				plugins: ["babel-plugin-react-compiler"],
			},
		}),
	],
});

export default config;
