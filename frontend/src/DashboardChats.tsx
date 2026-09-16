import { Papicons } from "@getpapillon/papicons";
import { BtnAddChat } from "./components/Button";

enum ChatPosition {
  Top,
  Center,
  Bottom,
}

// chat position refaire to the position of the current Chat in the list.
function Chat({chatPosition, iconName, title, text} : {chatPosition : ChatPosition, iconName: string, title : string, text : string}) {

  let mainDivStyle: string = "flex flex-row bg-white p-2.5 border-l-2 border-r-2 border-(--border) lg:border-t-2 lg:border-b-2 lg:rounded-2xl "

  if (chatPosition === ChatPosition.Top) {
    mainDivStyle = mainDivStyle.concat("rounded-t-xl border-t-2")
  } else if (chatPosition === ChatPosition.Center) {
    mainDivStyle = mainDivStyle.concat("border-b-2 border-t-2")
  } else if (chatPosition === ChatPosition.Bottom) {
    mainDivStyle = mainDivStyle.concat("rounded-b-xl border-b-2")
  }

  return (
    <>
      <div className={mainDivStyle}>
        <div className="flex items-center gap-5">
          <div className="flex justify-center items-center rounded-full bg-linear-to-r from-(--purple) to-(--bright-purple) w-15 h-15 shrink-0">
            <Papicons className="text-white" name={iconName} />
          </div>
          <div>
            <h1>{title}</h1>
            <p className="text-(--text-gray)" >{text}</p>
          </div>
        </div>
      </div>
    </>
  );
}

function Chats({title} : {title: string}) {
  return (
    <>
      <div className="studentsCardFollows flex flex-col gap-2.5">
        <p className="font-regular text-1xl text-(--text-gray)">{title}</p>
        <div className="grid grid-cols-1 lg:grid-cols-3 lg:gap-4"> 
            <Chat chatPosition={ChatPosition.Top}    iconName="GraduationHat" title={"Exam 00"} text={"Communication entre tuteur posté au C2 et au C3 lors de la section d'examen 00, la communication avec un membre du staff est aussi possible."}/>
            <Chat chatPosition={ChatPosition.Center} iconName="GraduationHat" title={"Communication Tuteur / Staff"} text={"Rendre la communication plus fluide et plus spontanée entre le staff et les tuteurs"}/>
            <Chat chatPosition={ChatPosition.Bottom} iconName="GraduationHat" title={"Complication avec etoad"} text={"Groupe sur l'affaire du malicieux etoad et son siz seven de brain rot qui a contaminer toute l'école."}/>
        </div>
      </div>
    </>
  );
}

export function DashboardChats() {
  return (
    <>
      <div className="dashboardSearch gap-5">
        <p className="font-semibold text-2xl pl-3">Chats</p>
        <input className="dashboardSearchProfile" type="text" placeholder="Rechercher un chat" />
      </div>
      <div>
      <BtnAddChat />
      </div>
      <Chats title="Les alertes"/>
      <Chats title="Tes groupes"/>
    </>
  );
}
