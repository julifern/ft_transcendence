import { useEffect, useRef } from "react";

export function DynamicTextArea({ str, name, maxLength }: { str: string, name: string, maxLength: number }) {
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
    <textarea name={name} className="w-full h-fit" ref={textAreaRef} maxLength={maxLength} placeholder={str}/>
  );
}

export function makeItPrety(str: string) : string {
  return (str.charAt(0).toUpperCase() + str.slice(1).toLowerCase());
}

export function slugify(str: string) : string {
  return (str
    .toLowerCase()
    .trim()
    .replace(/[^\w\s-]/g, '')
    .replace(/[\s_-]+/g, '-')
    .replace(/^-+|-+$/g, ''));
}
