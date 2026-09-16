import { useEffect, useRef } from "react";

export function dynamiqueTextArea() {
  let textArea = document.querySelector("textarea")

  if (!textArea)
    return (<></>);

  console.log("textArea: " + textArea);
  textArea.addEventListener("input", () => {
    textArea.style.height = "auto"
    textArea.style.height = textArea.scrollHeight + "px"
  })
}

// export function DynamicTextArea({str}: {str: string}) {
//   const textAreaRef = useRef(null);
  
//   useEffect(() => {
//     if (!textAreaRef)
//       return ();
//     textAreaRef.addEventListener("input", () => {
//       textAreaRef.style.height = "auto"
//       textAreaRef.style.height = textAreaRef.scrollHeight + "px"
//     })
//   }, []);
//   return (
//     <>
//       <textarea className="w-full h-fit" ref={textAreaRef}>{str}</textarea>
//     </>
//   );
// }


// import { useEffect, useRef } from "react";

export function DynamicTextArea({ str, maxLength }: { str: string; maxLength: number }) {
  const textAreaRef = useRef<HTMLTextAreaElement>(null);

  // function call after render
  useEffect(() => {
    const textArea = textAreaRef.current;
    if (!textArea) return;

    const handleInput = () => {
      textArea.style.height = "auto";
      textArea.style.height = textArea.scrollHeight + "px";
    };

    textArea.addEventListener("input", handleInput);

    return () => {
      textArea.removeEventListener("input", handleInput);
    };
  }, []);

  return (
    <textarea className="w-full h-fit" ref={textAreaRef} maxLength={maxLength} placeholder={str}
    />
  );
}
