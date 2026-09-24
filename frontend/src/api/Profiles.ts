import { useQuery } from '@tanstack/react-query';
import type { profiles } from '../types/ObjStudent';

export const getProfilscacheName = ["auth", "api", "profils"];

export async function getProfilsHook(): Promise<profiles> {
  const res = await fetch(
    "/auth/api/profils/",
    {
      credentials: "include",
    }
  )
  if (!res.ok) {
    throw new Error(`HTTP ${res.status}`)
  }
  return res.json()
}

export function useGetProfiles() {
  return (useQuery({ queryKey: getProfilscacheName, queryFn: getProfilsHook,
    retry: (failureCount: number, error: Error) => {
      if (error.message === "HTTP 401") {
        return (false);
      }
      return (failureCount < 3);
    }
  }));
}
