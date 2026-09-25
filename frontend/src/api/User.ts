import { useQuery } from '@tanstack/react-query';
import type { User } from '../types/User';

export async function getUser(): Promise<User> {
  const res = await fetch(
    "auth/me/",
    {
      credentials: "include",
    }
  )
  if (!res.ok) {
    throw new Error(`HTTP ${res.status}`)
  }
  return res.json()
}

export function useGetUser() {
  return (useQuery<User, Error>({ queryKey: ["auth", "me"], queryFn: getUser,
    retry: (failureCount: number, error: Error) => {
      if (error.message === "HTTP 401") {
        return (false);
      }
      return (failureCount < 3);
    }
  }));
}
