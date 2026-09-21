import type { profiles } from '../types/ObjStudent';

export const getProfilscacheName = ["auth", "api", "profils"];

export async function getProfilsHook(): Promise<profiles> {
  const res = await fetch(
    "http://localhost:8000/auth/api/profils/",
    {
      credentials: "include",
    }
  )
  if (!res.ok) {
    throw new Error(`HTTP ${res.status}`)
  }
  return res.json()
}
