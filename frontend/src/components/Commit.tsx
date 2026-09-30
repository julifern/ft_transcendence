import { Papicons } from "@getpapillon/papicons"
import { BtnAddCommit, BtnVoirIntra } from "./Button";
import type { ProfileDashboard } from "../types/ObjStudent";
import { type Comment } from "../types/Comment";
import { Dropdown, type MenuProps } from "antd";
import { queryClient } from "../main";
import { DynamicTextArea } from "./Utils";
import { useState } from "react";

export function CommitLeaf() {
  return (
    <>
      <div className="flex flex-col items-center justify-center" style={{marginTop: "-2px"}}>
        <div className="w-2.5 h-2.5 rounded-full bg-(--purple) shrink-0"></div>
        <div className="flex w-1 h-full" style={{backgroundColor: "var(--purple)", marginTop: "-2px"}}></div>
        <div className="w-1 h-1 rounded-full bg-(--purple) shrink-0" style={{marginTop: "-2px"}}></div>
      </div>
    </>
  )
}

export function CommitContent({ comment }: { comment: Comment }) {
  const isNewCommit = true;
  return (
      <>
        <div className="flex flex-col w-full h-fit gap-0.75">
          {isNewCommit ? <p className="w-fit h-fit rounded-full pl-3 pr-3 text-white text-[10px] bg-(--purple)">Nouveau</p> : <></>}
          <h1 className="w-full overflow-hidden text-ellipsis">
            {comment.content}
          </h1>
          <div className="flex flex-row items-center gap-1 pb-1">
            <Papicons className="text-(--text-gray) w-4 h-4" name="PenAlt" />
            <p className="text-[12px] text-(--text-gray)">
              {comment.author} - {comment.created_at}
            </p>
          </div>
        </div>
      </>
  )
}

export function EmptyCommit(student: ProfileDashboard) {
  return (
    <>
      <div className="flex flex-col items-center justify-center w-full h-full gap-1.25">
        <Papicons className="w-15 h-15 text-(--text-gray)" name="Ghost" />
        <h1>
          Aucune activité
        </h1>
        <div className="flex flex-col w-full h-fit gap-1.5">
          <BtnAddCommit {...student} />
          <BtnVoirIntra {...student} />
        </div>
      </div>
    </>
  );
}

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

export function Commit({ comment, login}: {comment: Comment, login: string}) {
  const [commitEditing, setCommitEditing] = useState(false);
  const [editedCommit, setEditedCommit] = useState("");
  const items: MenuProps['items'] = [
    {
      label: "Copier",
      key: "cop",
      onClick: () => {navigator.clipboard.writeText(comment.content)},
      icon: <Papicons name="List" />
    },
    {
      label: "Modifier",
      key: "mod",
      onClick: () => {setCommitEditing(!commitEditing)},
      icon: <Papicons name="PenAlt" />
    },
    {
      label: "Supprimer",
      key: "sup",
      danger: true,
      onClick: () => {commitDelete(comment.id, login)},
      icon: <Papicons name="Trash" />
    },
  ];
  function sendEditedCommit() {
    setCommitEditing(!commitEditing);
    commitModify(comment.id, editedCommit, login);
  }
  return (
    <>
      {
        commitEditing ?
          <>
            <div className="flex p-3">
              <DynamicTextArea placeholder={"Entre votre message..."} defaultValue={comment.content} maxLength={100} onChange={(e) => {setEditedCommit(e.target.value);}} />
            </div>
            <div className="flex flex-rows gap-2 pb-2">
              <button onClick={() => setCommitEditing(!commitEditing)} className="w-full rounded-full bg-(--gray) text-black">Annuler</button>
              <button onClick={() => sendEditedCommit()} className="w-full rounded-full bg-(--purple) text-white">Modifier</button>
            </div>
          </>
        :
          <Dropdown menu={{items}} trigger={["contextMenu"]}>
            <div className="flex flex-row h-fit">
              <CommitLeaf />
              <CommitContent comment={comment}/>
            </div>
          </Dropdown>
      }
    </>
  );
}
