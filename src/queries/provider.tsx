import { createSyncStoragePersister } from '@tanstack/query-sync-storage-persister'
import { QueryClient } from '@tanstack/react-query'
import { PersistQueryClientProvider } from '@tanstack/react-query-persist-client'
import { useMemo } from 'react'

export default function Provider({ children }: { children: React.ReactNode }) {
  const [queryClient, persister] = useMemo(() => {
    const qc = new QueryClient({
      defaultOptions: {
        queries: {
          // With SSR, we usually want to set some default staleTime
          // above 0 to avoid refetching immediately on the client
          staleTime: 1 * 60 * 1000, // 1 minute
          gcTime: 24 * 60 * 60 * 1000, // 1 day, cached
        },
      },
    })
    const persister = createSyncStoragePersister({
      storage: window.localStorage,
    })
    return [qc, persister]
  }, [])

  return (
    <PersistQueryClientProvider client={queryClient} persistOptions={{ persister }}>
      {children}
    </PersistQueryClientProvider>
  )
}
