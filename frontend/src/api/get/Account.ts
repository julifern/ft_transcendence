import { useQuery } from '@tanstack/react-query';
import type { Account } from '../../types/Account';

export async function getAccount(): Promise<Account> {
  const res = await fetch(
    "/auth/account",
    {
      credentials: "include",
    }
  )
  if (!res.ok) {
    throw new Error(`HTTP ${res.status}`)
  }
  return res.json()
}

export function useGetAccount() {
  return (useQuery<Account, Error>({ queryKey: ["auth", "account"], queryFn: getAccount,
    retry: (failureCount: number, error: Error) => {
      if (error.message === "HTTP 401") {
        return (false);
      }
      return (failureCount < 3);
    }
  }));
}
