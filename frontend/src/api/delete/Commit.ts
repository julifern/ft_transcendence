import { queryClient } from "../../main";

export function commitDelete(id: number, login: string) {
  fetch(`/auth/comment/${id}/`, {
    method: "DELETE",
    credentials: "include",
  }).then().then(() => {
      queryClient.invalidateQueries({queryKey: ["auth", "api", "profils", login]});
      queryClient.invalidateQueries({queryKey: ["auth", "api", "dashboard"]});
    }
  );
}
