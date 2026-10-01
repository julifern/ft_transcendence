import { useQuery } from '@tanstack/react-query';
import type { MyreAnswer } from '../types/Ai';

async function getMyreAnswer(query: string): Promise<MyreAnswer> {
  const res = await fetch("/api/ai/ask/", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    credentials: "include",
    body: JSON.stringify({ query: query }),
  }).then().then();
  if (!res.ok) {
    throw new Error(`HTTP ${res.status}`)
  }
  return res.json()
}

export function useGetMyreAnswer(query: string) {
  return (useQuery<MyreAnswer, Error>({ queryKey: ["api", "ai", "ask"], queryFn: () => getMyreAnswer(query),
    retry: (failureCount: number, error: Error) => {
      if (error.message === "HTTP 401") {
        return (false);
      }
      return (failureCount < 3);
    }
  }));
}
