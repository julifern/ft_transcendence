import { Papicons } from "@getpapillon/papicons";
import type { objStudent } from "./ObjStudent";
import Popup from "reactjs-popup";
import { InlineIcon } from "@iconify/react";
import { DynamicTextArea } from "./Utils";

export function BtnVoirIntra(student: objStudent) {
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

function popupNewCommit(student: objStudent) {
  alert("try to write a new commit for " + student.login);
}

function AddCommitPopupContente(student: objStudent) {
  return (
    <>
      <div className="module flex flex-col h-fit bg-(--bg) p-10 gap-2 border-2 border-solid border-(--gray)" style={{borderRadius: "50px"}}>
        <h1>Contenu de votre nouveau commit:</h1>
        <div className="module flex flex-col">
          <DynamicTextArea maxLength={100} str="Description (100 char max)" />
        </div>
        <button onClick={() => popupNewCommit(student)} type="button" className="w-full rounded-full bg-(--purple) text-white">
          <div className="flex justify-center items-center p-2 gap-1">
            <InlineIcon icon="fa:paper-plane" />
            <p>Envoyer le commit</p>
          </div>
        </button>
      </div>
    </>
  );
}

export function BtnAddCommit(student: objStudent) {
  return (
    <>
      <Popup trigger=
        {
          <button type="button" className="w-full rounded-full bg-(--purple) text-white">
            <div className="flex justify-center items-center p-2 gap-1">
              <Papicons name="Add" />
              <p>Ajouter un commit</p>
            </div>
          </button>
        }
        modal nested>
        <AddCommitPopupContente {...student}/>
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

function follow(student: objStudent) {
  alert("try to follow : {" + student.login + "}.");
}

export function BtnFollow(student: objStudent) {
  return (
    <>
      <button onClick={() => follow(student)} type="button" className="w-full rounded-full bg-(--purple) text-white">
        <div className="flex justify-center items-center p-2 gap-1">
          <Papicons name="Add" />
          <p>Suivre</p>
        </div>
      </button>
    </>
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
          <DynamicTextArea maxLength={30} str="Titre (30 char max)" />
        </div>
        <div className="module flex flex-col">
          <DynamicTextArea maxLength={142} str="Description (142 char max)" />
        </div>
        <button onClick={() => addChat()} type="button" className="w-full rounded-full bg-(--purple) text-white">
          <div className="flex justify-center items-center p-2 gap-1">
            <InlineIcon icon="fa:paper-plane" />
            <p>Envoyer le commit</p>
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
