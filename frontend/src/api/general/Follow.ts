import { queryClient } from "../../main";

export async function handleFollow(follow: boolean, login: string) {
  await fetch(`/auth/follow/${login}/`, {
    method: follow ? "POST" : "DELETE",
    credentials: "include",
  });
  queryClient.invalidateQueries({queryKey: ["auth", "me"]})
}
