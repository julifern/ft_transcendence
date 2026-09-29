import { Papicons } from "@getpapillon/papicons";
import { useState } from "react";

function NavBarContente() {
  return (
    <p>navBare</p>
  );
}

export function NavBar() {
  const [displayNavBar, setDisplayNavBar] = useState(false);
  return (
    <>
      <div className="fixed bottom-0 h-fit justify-center items-center">
        <button onClick={() => {setDisplayNavBar(!displayNavBar)}}>
          <Papicons name="ChevronUp" />
        </button>
        {
          displayNavBar ? <NavBarContente /> : <></>
        }
      </div>
    </>
  );
}
