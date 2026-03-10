import type { QueryClient } from "@tanstack/react-query";
import {
	createRootRouteWithContext,
	HeadContent,
	Outlet,
	Scripts,
} from "@tanstack/react-router";
import ClerkProvider from "../integrations/clerk/provider";
import ConvexProvider from "../integrations/convex/provider";
import TanStackQueryProvider from "../integrations/tanstack-query/root-provider";
import appCss from "../styles.css?url";

interface MyRouterContext {
	queryClient: QueryClient;
}

export const Route = createRootRouteWithContext<MyRouterContext>()({
	head: () => ({
		meta: [
			{ charSet: "utf-8" },
			{ name: "viewport", content: "width=device-width, initial-scale=1" },
			{ title: "AirSentinel OS - Environmental Intelligence" },
			{
				name: "description",
				content:
					"Hyper-local environmental monitoring and decision intelligence platform",
			},
		],
		links: [
			{ rel: "stylesheet", href: appCss },
			{ rel: "preconnect", href: "https://fonts.googleapis.com" },
			{
				rel: "preconnect",
				href: "https://fonts.gstatic.com",
				crossOrigin: "anonymous",
			},
			{
				rel: "stylesheet",
				href: "https://fonts.googleapis.com/css2?family=Space+Grotesk:wght@400;500;700&family=IBM+Plex+Mono:wght@400;500;600&display=swap",
			},
		],
	}),
	component: RootComponent,
});

function RootComponent() {
	return (
		<html lang="en" className="dark">
			<head>
				<HeadContent />
			</head>
			<body className="font-sans antialiased bg-[#09090b] text-white min-h-screen">
				<ClerkProvider>
					<ConvexProvider>
						<TanStackQueryProvider>
							<Outlet />
						</TanStackQueryProvider>
					</ConvexProvider>
				</ClerkProvider>
				<Scripts />
			</body>
		</html>
	);
}
