import type { ReactNode } from 'react'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'

let queryClient: QueryClient | undefined

export function getQueryClient() {
  if (!queryClient) {
    queryClient = new QueryClient({
      defaultOptions: {
        queries: {
          staleTime: 5 * 60 * 1000,
        },
      },
    })
  }
  return queryClient
}

export default function TanStackQueryProvider({
  children,
}: {
  children: ReactNode
}) {
  const client = getQueryClient()

  return (
    <QueryClientProvider client={client}>
      {children}
    </QueryClientProvider>
  )
}
