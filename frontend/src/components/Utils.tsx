import { useEffect, useRef } from "react";
import type { User } from "../types/User";

export function DynamicTextArea({ placeholder, defaultValue, maxLength, onChange }: { placeholder: string, defaultValue: string, maxLength: number, onChange: React.ChangeEventHandler<HTMLTextAreaElement> | undefined}) {
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
    <textarea className="w-full h-fit" ref={textAreaRef} maxLength={maxLength} placeholder={placeholder} onChange={onChange} defaultValue={defaultValue}/>
  );
}

export function isFollowed(login: string, user: User) : boolean {
  for (let i = 0; i < user.user_dict.followed.length; i++) {
    if (user.user_dict.followed[i] === login)
      return (true);
  }
  return (false);
}

export function makeItPrety(str: string) : string {
  return (str.charAt(0).toUpperCase() + str.slice(1).toLowerCase());
}

export function getRiskLevelColor(risk_level: string) {
  switch (risk_level) {
    case "ok":
      return ("--green");
    case "warning":
      return ("--yellow");
    case "critical":
      return ("--red");
    default:
      return ("--purple")
  }
}

export function slugify(str: string) : string {
  return (str
    .toLowerCase()
    .trim()
    .replace(/[^\w\s-]/g, '')
    .replace(/[\s_-]+/g, '-')
    .replace(/^-+|-+$/g, ''));
}
