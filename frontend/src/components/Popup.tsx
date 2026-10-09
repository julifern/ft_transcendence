import { InlineIcon } from "@iconify/react";
import { DynamicTextArea } from "./Utils";
import { useState } from "react";


export function PopupContente({Btntext, maxLength, placeholder, defaultValue, fn, close} : {
  Btntext: string,
  maxLength: number,
  placeholder: string,
  defaultValue: string,
  fn: (text: string) => void,
  close: () => void,
})
{
  const [text, setText] = useState("");
  return (
    <div className="module flex flex-col h-fit bg-(--bg) p-10 gap-2 border-2 border-solid border-(--gray)" style={{borderRadius: "50px"}}>
      <div className="module flex flex-col">
        <DynamicTextArea maxLength={maxLength} placeholder={placeholder} defaultValue={defaultValue} onChange={(e) => setText(e.target.value)}/>
      </div>
      <button onClick={() => {fn(text);close()}} type="button" className="w-full rounded-full bg-(--purple) text-white">
        <div className="flex justify-center items-center p-2 gap-1">
          <InlineIcon icon="fa:paper-plane" />
          <p>{Btntext}</p>
        </div>
      </button>
    </div>
  );
}