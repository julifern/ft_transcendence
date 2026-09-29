import { Papicons } from "@getpapillon/papicons";
import { useState } from "react";
import "./styles/NavBar.css"

function NavBarContente() {
  return (
    <div className="flex flex-rows w-full justify-around">
      <p>1</p>
      <p>2</p>
      <p>3</p>
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
            <Papicons name={displayNavBar ? "ChevronDown" : "ChevronUp"} />
          </button>
          {
            displayNavBar ? <NavBarContente /> : <></>
          }
        </div>
      </div>
    </>
  );
}
