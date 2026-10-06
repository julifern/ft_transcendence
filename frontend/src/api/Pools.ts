import { useQuery } from '@tanstack/react-query';
import type { Pools } from '../types/Pools';

export async function getPools(): Promise<Pools> {
  const res = await fetch(
    "/auth/api/pools/",
    {
      credentials: "include",
    }
  )
  if (!res.ok) {
    throw new Error(`HTTP ${res.status}`)
  }
  return res.json()
}

export function useGetPools() {
  return (useQuery<Pools, Error>({ queryKey: ["auth", "api", "pools"], queryFn: getPools,
    retry: (failureCount: number, error: Error) => {
      if (error.message === "HTTP 401") {
        return (false);
      }
      return (failureCount < 3);
    }
  }));
}
