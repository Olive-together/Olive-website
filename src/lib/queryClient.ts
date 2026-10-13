import { QueryClient } from '@tanstack/react-query';

export const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 5 * 60 * 1000,   // 5 min — no refetch while "fresh"
      gcTime:    30 * 60 * 1000,  // 30 min — keep in memory across navigation
      retry: 1,
      refetchOnWindowFocus: false,
    },
  },
});
