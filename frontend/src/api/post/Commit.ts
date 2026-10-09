import { queryClient } from "../../main";


export function handleSubmit(CommitContent: string, login: string) {
  fetch("/auth/comment/" + login + "/", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    credentials: "include",
    body: JSON.stringify({ content: CommitContent }),
  }).then(res => res.json()).then(() => {
    queryClient.invalidateQueries({queryKey: ["auth", "api", "profils", login]});
    queryClient.invalidateQueries({queryKey: ["auth", "api", "dashboard"]});
  });
}