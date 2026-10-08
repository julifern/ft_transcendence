import { queryClient } from "../../main";

export function apiDeleteWhiteListLogin(login: string) {
  fetch("/auth/whitelist/", {
    method: "Delete",
    headers: { "Content-Type": "application/json" },
    credentials: "include",
    body: JSON.stringify({ login: login }),
  }).then().then(() => {
    queryClient.invalidateQueries({queryKey: ["auth", "account"]});
  });
}