import { Papicons } from "@getpapillon/papicons";
import { useState } from "react";
import "./styles/NavBar.css"
import { Link } from "react-router-dom";

function ButtonNavbar({ iconName, buttonText, path}: { iconName: string, buttonText: string, path: string }) {
  return (
    <>
      <Link to={path} className="flex flex-col w-full justify-center items-center">
        <Papicons className="text-(--text-gray)" name={iconName} />
        <p className="text-(--text-gray)">{buttonText}</p>
      </Link>
    </>
  );
}

function MainButtonNavbar({ iconName, buttonText, path}: { iconName: string, buttonText: string, path: string}) {
  return (
    <>
      <Link to={path} className="flex w-full justify-center">
        <div className="flex flex-col justify-center w-fit pr-3 pl-3 pt-0.5 pb-0.5 items-center bg-(--purple) rounded-full">
          <Papicons className="text-white" name={iconName} />
          <p className="text-white">{buttonText}</p>
        </div>
      </Link>
    </>
  );
}

function NavBarContente() {
  return (
    <div className="flex flex-rows w-full justify-around">
      <ButtonNavbar iconName={"grid"} buttonText={"Dashboard"} path="/" />
      <ButtonNavbar iconName={"textBubble"} buttonText={"Chats"} path="/chats" />
      <MainButtonNavbar iconName={"user"} buttonText={"Account"} path="/account" />
    </div>
  );
}

export function NavBar() {
  const [displayNavBar, setDisplayNavBar] = useState(false);
  return (
    <>
      <div className="flex justify-center items-center fixed bottom-0 left-0 right-0">
        <div className="semiCircle flex flex-col justify-center items-center border-2 border-(--border)">
          <button onClick={() => {setDisplayNavBar(!displayNavBar)}}>
            <Papicons className="text-(--text-gray)" name={displayNavBar ? "ChevronDown" : "ChevronUp"} />
          </button>
          {
            displayNavBar ? <NavBarContente /> : <></>
          }
        </div>
      </div>
    </>
  );
}
