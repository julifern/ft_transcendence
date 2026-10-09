import { queryClient } from "../../main";

export function apiAddWhiteListLogin(login: string) {
  fetch("/auth/whitelist/", {
	method: "POST",
	headers: { "Content-Type": "application/json" },
	credentials: "include",
	body: JSON.stringify({ login: login }),
  }).then().then(() => {
	queryClient.invalidateQueries({queryKey: ["auth", "account"]});
  });
}