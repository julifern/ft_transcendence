import { Papicons } from "@getpapillon/papicons";
import type { ProfileDashboard } from "../types/ObjStudent";
import Popup from "reactjs-popup";
import { InlineIcon } from "@iconify/react";
import { DynamicTextArea, isFollowed } from "./Utils";
import { queryClient } from "../main";
import { useGetUser } from "../api/get/User";
import { useState } from "react";
import { useGetPools } from "../api/get/Pools";
import type { Pool } from "../types/Pools";
import { apiAddWhiteListLogin } from "../api/post/WhiteList";

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

function AddCommitPopupContente({ student, close } : {student: ProfileDashboard, close: () => void}) {
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

function SortBtn({name, idx, setSortType, selected}: {name: string, idx: number, setSortType: React.Dispatch<React.SetStateAction<number>>, selected: boolean}) {
  const selectedStyleBox = selected ? " bg-(--purple) " : " border-2 border-(--purple) ";
  return (
    <button className={`flex flex-rows items-center w-full h-full p-3 gap-2`} onClick={() => setSortType(idx)}>
      <div className={`flex justify-center items-center w-5 h-5 ${selectedStyleBox} rounded`}>
        {
          selected ? <Papicons className="w-4 h-4 text-white" name="Check" /> : <></>
        }
      </div>
      <p className="text-xl bold">
        {name}
      </p>
    </button>
  );
}

function SortBtns({buttonName, setSortType, selectedIdx}: {
  buttonName: string[],
  setSortType: React.Dispatch<React.SetStateAction<number>>,
  selectedIdx: number
})
{
  return (
    <>
      {
        buttonName.map((name, idx) => <SortBtn key={idx} name={name} idx={idx} setSortType={setSortType} selected={selectedIdx === idx}/>)
      }
    </>
  );
}

function FilterListOpt({ pool, index, selected}: { pool: Pool, index: number, selected: boolean }) {
  return (
    <option selected={selected} value={index}>{`${pool.month}-${pool.year}`}</option>
  );
}

export function FilterBtn({ setPoolIdx, setSortType, setReverseSort, poolIdx, sortType, reverseSort} : {
  setPoolIdx : React.Dispatch<React.SetStateAction<number>>,
  setSortType : React.Dispatch<React.SetStateAction<number>>,
  setReverseSort: React.Dispatch<React.SetStateAction<number>>,
  poolIdx: number,
  sortType: number,
  reverseSort: number})
{
  const api = useGetPools();
  if (api.isPending) return <p>Loading...</p>
  if (api.error) return <p>An error has occurred: {api.error.message}</p>
  const lstFilterBtn: string[] = ["Level", "Risk", "Login"];
  const selectedStyleBox = reverseSort ? " bg-(--purple) " : " border-2 border-(--purple) ";
  return (
    <Popup
      trigger={
          <Papicons className="text-(--text-gray)" name="Filter" />
        }
        modal nested>
      <div className="flex flex-col bg-(--bg) rounded-xl border-2 border-(--gray) w-[80vw] h-[80vh] p-5 gap-3">
        <h1 className="text-2xl bold">Filtre Piscines</h1>
        <span className=" bg-(--gray) w-full h-0.5"></span>
        <div>
          <select name="pools" id="pools" onChange={(e) => setPoolIdx(parseInt(e.target.value))}>
            {
              api.data.available_pools.map((pool: Pool, index: number) => <FilterListOpt key={index} pool={pool} index={index} selected={poolIdx === index}/>)
            }
          </select>
        </div>
        <div className="flex flex-col w-full justify-start border-2 border-(--purple) rounded-2xl p-5">
          <SortBtns buttonName={lstFilterBtn} setSortType={setSortType} selectedIdx={sortType} />
          <span className="w-full h-1 bg-(--bright-purple) rounded"></span>
          <button className={`flex flex-rows items-center w-full h-full p-3 gap-2`} onClick={() => setReverseSort(reverseSort ? 0 : 1)}>
            <div className={`flex justify-center items-center w-5 h-5 ${selectedStyleBox} rounded`}>
              {
                reverseSort ? <Papicons className="w-4 h-4 text-white" name="Check" /> : <></>
              }
            </div>
            <p className="text-xl bold">
              reverse
            </p>
          </button>
        </div>
      </div>
    </Popup>
  );
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
          <p>Voir plus</p>setSortType
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

function AddWhiteListPopupContente() {
  const [login, setLogin] = useState("");
  return (
      <div className="module flex flex-col h-fit bg-(--bg) p-10 gap-2 border-2 border-solid border-(--gray)" style={{borderRadius: "50px"}}>
        <div className="module flex flex-col">
          <DynamicTextArea maxLength={100} placeholder={"login"} defaultValue={""} onChange={(e) => setLogin(e.target.value)}/>
        </div>
        <button onClick={() => apiAddWhiteListLogin(login)} type="button" className="w-full rounded-full bg-(--purple) text-white">
          <div className="flex justify-center items-center p-2 gap-1">
            <InlineIcon icon="fa:paper-plane" />
            <p>Ajouter a la white list</p>
          </div>
        </button>
      </div>
  )
}

export function AddWhiteList() {
  return (
     <Popup trigger=
        {
          <button className="flex flex-row items-center rounded-full bg-(--purple) text-xl text-white pt-1 pb-1 pl-3 pr-3" onClick={() => AddWhiteList()}>
            <Papicons name="Add" />
            Ajouter a la with list
          </button>
        }
        modal nested>
        <AddWhiteListPopupContente />
      </Popup>
  );
}
