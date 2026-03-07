import { createRouter as createTanStackRouter } from '@tanstack/react-router'
import { routeTree } from './routeTree.gen'
import { getQueryClient } from './integrations/tanstack-query/root-provider'

export function getRouter() {
  const router = createTanStackRouter({
    routeTree,
    context: {
      queryClient: getQueryClient(),
    },
    scrollRestoration: true,
    defaultPreload: 'intent',
    defaultPreloadStaleTime: 0,
  })

  return router
}

declare module '@tanstack/react-router' {
  interface Register {
    router: ReturnType<typeof getRouter>
  }
}
