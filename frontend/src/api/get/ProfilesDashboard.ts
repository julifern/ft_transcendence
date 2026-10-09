import { useQuery } from '@tanstack/react-query';
import type { ProfilesDashboard } from '../../types/ObjStudent';
import { useGetPools } from './Pools';

export async function getProfilesDashboard(url: string): Promise<ProfilesDashboard> {
  const res = await fetch(
    url,
    {
      credentials: "include",
    }
  )
  if (!res.ok) {
    throw new Error(`HTTP ${res.status}`)
  }
  return res.json()
}

export function useGetProfilesDashboard(poolIdx: number) {
  const api = useGetPools();
  const pool = api.data?.available_pools?.[poolIdx];
  const year = pool?.year;
  const month = pool?.month;
  const dashboardQuery = useQuery<ProfilesDashboard, Error>({ queryKey: ["auth", "api", "dashboard", year, month], queryFn: () =>
      getProfilesDashboard(
        `/auth/api/dashboard/?year=${year}&month=${month}`
      ),
    enabled: !!year && !!month,
    retry: (failureCount, error) => {
      if (error.message === "HTTP 401") {
        return false;
      }
      return failureCount < 3;
    },
  });
  return {
    ...dashboardQuery,
    isLoadingPools: api.isPending,
    poolsError: api.error,
  };
}