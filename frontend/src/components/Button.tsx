import { Papicons } from "@getpapillon/papicons";
import type { ProfileDashboard } from "../types/ObjStudent";
import Popup from "reactjs-popup";
import { InlineIcon } from "@iconify/react";
import { DynamicTextArea, isFollowed } from "./Utils";
import { queryClient } from "../main";
import { useNavigate } from "react-router-dom";
import { useGetUser } from "../api/User";
import type { User } from "../types/User";

import "./../styles/App.css"

export function BtnVoirIntra(student: ProfileDashboard) {
  return (
    <>
      <a className="w-full rounded-full bg-(--gray)" target="_blank" href={"https://profile.intra.42.fr/users/" + student.login}>
        <div className="flex justify-center items-center p-2 gap-1">
          <Papicons name="ArrowRightUp" className="h-fit text-(--text-gray)" />
          <p>Voir sur l'intra</p>
        </div>
      </a>
    </>
  )
}

type Props = {
  student: ProfileDashboard;
  close: () => void;
};

function AddCommitPopupContente({ student, close } : Props) {
  const navigate = useNavigate();
  function handleSubmit(e: React.SubmitEvent<HTMLFormElement>, login: string, close: () => void) {
    // Prevent the browser from reloading the page
    e.preventDefault();
    const form = e.target;
    const commitContent: string | undefined = new FormData(form).get("commitContent")?.toString();
    if (!commitContent) {
      console.log("failed to get the content of your commit message...")
      close(); // close popup
      return ;
    }
    fetch("http://localhost:8000/auth/comment/" + login + "/", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      credentials: "include",
      body: JSON.stringify({ content: commitContent }),
    }).then(res => res.json()).then(() => {
      close(); // close popup
      queryClient.invalidateQueries({queryKey: ["auth", "api", "profils", login]})
      navigate("/profile/" + login);
    });
  }
  return (
    <>
      <div className="module flex flex-col h-fit bg-(--bg) p-10 gap-2 border-2 border-solid border-(--gray)" style={{borderRadius: "50px"}}>
        <form action="post" onSubmit={(e) => handleSubmit(e, student.login, close)}>
          <h1>Contenu de votre nouveau commit:</h1>
          <div className="module flex flex-col">
            <DynamicTextArea name="commitContent" maxLength={100} str="Description (100 char max)" />
          </div>
          <button type="submit" className="w-full rounded-full bg-(--purple) text-white">
            <div className="flex justify-center items-center p-2 gap-1">
              <InlineIcon icon="fa:paper-plane" />
              <p>Envoyer le commit</p>
            </div>
          </button>
        </form>
      </div>
    </>
  );
}

export function BtnAddCommit(student: ProfileDashboard) {
  return (
    <>
      <Popup
        trigger={
          <button type="button" className="w-full rounded-full bg-(--purple) text-white">
            <div className="flex justify-center items-center p-2 gap-1">
              <Papicons name="Add" />
              <p>Ajouter un commit</p>
            </div>
          </button>
        }
        modal nested>
      { close => (<AddCommitPopupContente student={student} close={close} />)}
      </Popup>
    </>
  )
}

function ScrollCommitHistory() {
  alert("try to scroll...");
}

export function BtnSeeMoreCommit() {
  return (
    <>
      <button onClick={ScrollCommitHistory} type="button" className="w-full rounded-full bg-(--gray)" >
        <div className="flex justify-center items-center p-2 gap-1">
          <Papicons name="ArrowRightUp" className="h-fit text-(--text-gray)" />
          <p>Voir plus</p>
        </div>
      </button>
    </>
  )
}

function BtnFollowBase({txt, rotate, login, handlefunction} : {txt: string, rotate: number, login: string, handlefunction: (login: string) => void}) {
  return (
    <button type="submit" className="w-full rounded-full bg-(--purple) text-white" onClick={() => (handlefunction(login))}>
      <div className="flex justify-center items-center p-2 gap-1">
        <span className="follow-btn-icon" style={{display: "inline-block", transition: "transform 0.25s ease", transform: `rotate(${rotate}deg)` }}>
          <Papicons rotate={rotate} name="Add" />
        </span>
        <p>{txt}</p>
      </div>
    </button>
  );
}

export function BtnFollow(student: ProfileDashboard) {
  const api = useGetUser();
  if (api.isPending) return <p>Loading...</p>
  if (api.error) return <p>An error has occurred: {api.error.message}</p>
  const followed = isFollowed(student.login, api.data);
  const handleFollow = async (follow: boolean) => {
    const res = await fetch(`http://localhost:8000/auth/follow/${student.login}/`, {
      method: follow ? "POST" : "DELETE",
      credentials: "include",
    });
    const data = await res.json();
    console.log(data)
    queryClient.invalidateQueries({queryKey: ["auth", "me"]})
  }
  return (
    <BtnFollowBase
      txt={followed ? "Ne plus suivre" : "Suivre"}
      rotate={followed ? 45 : 0}
      login={student.login}
      handlefunction={() => handleFollow(!followed)}
    />
  );
}

function iASummarise() {
  alert("faire un resumer du profile avec l'ia");
}

export function BtnIASummarise() {
  return (
    <>
      <button onClick={() => iASummarise()} type="button" className="w-full rounded-full bg-(--purple) text-white">
        <div className="flex justify-center items-center p-2 gap-1">
          <Papicons name="List" />
          <p>Faire un résumé avec l'IA</p>
        </div>
      </button>
    </>
  );
}

function addChat() {
  alert("try to add chat!");
}

function AddChatPopupContente() {
  return (
      <div className="module flex flex-col h-fit bg-(--bg) p-10 gap-2 border-2 border-solid border-(--gray)" style={{borderRadius: "50px"}}>
        <div className="module flex flex-col">
          <DynamicTextArea name="newChatName" maxLength={30} str="Titre (30 char max)" />
        </div>
        <div className="module flex flex-col">
          <DynamicTextArea name="newChatName" maxLength={142} str="Description (142 char max)" />
        </div>
        <button onClick={() => addChat()} type="button" className="w-full rounded-full bg-(--purple) text-white">
          <div className="flex justify-center items-center p-2 gap-1">
            <InlineIcon icon="fa:paper-plane" />
            <p>Crée le nouvel chat</p>
          </div>
        </button>
      </div>
  );
}

export function BtnAddChat() {
  return (
    <>
      <Popup trigger=
        {
          <button type="button" className="w-full rounded-full bg-(--purple) text-white">
            <div className="flex justify-center items-center p-2 gap-1">
              <Papicons name="Add" />
              <p>Ajouter un nouveaux chat</p>
            </div>
          </button>
        }
        modal nested>
        <AddChatPopupContente />
      </Popup>
    </>
  );
}
