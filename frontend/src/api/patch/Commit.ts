import { queryClient } from "../../main";

export function commitModify(id: number, msg: string, login: string) {
  fetch(`/auth/comment/${id}/`, {
    method: "PATCH",
    headers: { "Content-Type": "application/json" },
    credentials: "include",
    body: JSON.stringify({ content: msg }),
  }).then().then(() => {
      queryClient.invalidateQueries({queryKey: ["auth", "api", "profils", login]});
      queryClient.invalidateQueries({queryKey: ["auth", "api", "dashboard"]});
    }
  );
}