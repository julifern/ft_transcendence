import { queryClient } from "../../main";


export function handleSubmit(e: React.SubmitEvent<HTMLFormElement>, CommitContent: string, login: string, close: () => void) {
  // Prevent the browser from reloading the page
  e.preventDefault();
  fetch("/auth/comment/" + login + "/", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    credentials: "include",
    body: JSON.stringify({ content: CommitContent }),
  }).then(res => res.json()).then(() => {
    close(); // close popup
    queryClient.invalidateQueries({queryKey: ["auth", "api", "profils", login]});
    queryClient.invalidateQueries({queryKey: ["auth", "api", "dashboard"]});
  });
}