import { Papicons } from "@getpapillon/papicons";
import type { ProfileDashboard } from "../types/ObjStudent";
import Popup from "reactjs-popup";
import { InlineIcon } from "@iconify/react";
import { DynamicTextArea, isFollowed } from "./Utils";
import { queryClient } from "../main";
import { useGetUser } from "../api/User";
import { useState } from "react";

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
  const [commitContent, setCommitContent] = useState("");
  function handleSubmit(e: React.SubmitEvent<HTMLFormElement>, login: string, close: () => void) {
    // Prevent the browser from reloading the page
    e.preventDefault();
    fetch("/auth/comment/" + login + "/", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      credentials: "include",
      body: JSON.stringify({ content: commitContent }),
    }).then(res => res.json()).then(() => {
      close(); // close popup
      queryClient.invalidateQueries({queryKey: ["auth", "api", "profils", login]});
      queryClient.invalidateQueries({queryKey: ["auth", "api", "dashboard"]});
    });
  }
  return (
    <>
      <div className="module flex flex-col h-fit bg-(--bg) p-10 gap-2 border-2 border-solid border-(--gray)" style={{borderRadius: "50px"}}>
        <form action="post" onSubmit={(e) => handleSubmit(e, student.login, close)}>
          <h1>Contenu de votre nouveau commit:</h1>
          <div className="module flex flex-col">
            <DynamicTextArea maxLength={100} placeholder={"Description (100 char max)"} defaultValue={""} onChange={(e) => { setCommitContent(e.target.value); }} />
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
    const res = await fetch(`/auth/follow/${student.login}/`, {
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

function addChat() {
  alert("try to add chat!");
}

function AddChatPopupContente() {
  return (
      <div className="module flex flex-col h-fit bg-(--bg) p-10 gap-2 border-2 border-solid border-(--gray)" style={{borderRadius: "50px"}}>
        <div className="module flex flex-col">
          <DynamicTextArea maxLength={30} placeholder={"Titre (30 char max)"} defaultValue={""} onChange={undefined}/>
        </div>
        <div className="module flex flex-col">
          <DynamicTextArea maxLength={142} placeholder={"Description (142 char max)"} defaultValue={""} onChange={undefined}/>
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
