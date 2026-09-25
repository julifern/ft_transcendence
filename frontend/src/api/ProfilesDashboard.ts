import { useQuery } from '@tanstack/react-query';
import type { ProfilesDashboard } from '../types/ObjStudent';

export async function getProfilesDashboard(): Promise<ProfilesDashboard> {
  const res = await fetch(
    "auth/api/dashboard/",
    {
      credentials: "include",
    }
  )
  if (!res.ok) {
    throw new Error(`HTTP ${res.status}`)
  }
  return res.json()
}

export function useGetProfilesDashboard() {
  return (useQuery<ProfilesDashboard, Error>({ queryKey: ["auth", "api", "dashboard"], queryFn: getProfilesDashboard,
    retry: (failureCount: number, error: Error) => {
      if (error.message === "HTTP 401") {
        return (false);
      }
      return (failureCount < 3);
    }
  }));
}
