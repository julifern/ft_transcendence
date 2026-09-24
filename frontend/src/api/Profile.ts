import { useQuery } from '@tanstack/react-query';
import type { Profile } from '../types/ObjStudent';

export async function getProfile(login: string): Promise<Profile> {
  const res = await fetch(
    "http://localhost:8000/auth/api/profils/" + login,
    {
      credentials: "include",
    }
  )
  if (!res.ok) {
    throw new Error(`HTTP ${res.status}`)
  }
  return res.json()
}

export function useGetProfile(login: string) {
  return (useQuery({ queryKey: ["auth", "api", "profils", login], queryFn: () => getProfile(login),
    retry: (failureCount: number, error: Error) => {
      if (error.message === "HTTP 401") {
        return (false);
      }
      return (failureCount < 3);
    }
  }));
}

