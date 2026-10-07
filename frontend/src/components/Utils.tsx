import { useEffect, useRef } from "react";
import type { User } from "../types/User";
import type { ProfileDashboard } from "../types/ObjStudent";

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

export function getRiskLevelColorBg(risk_level: string) {
  switch (risk_level) {
    case "ok":
      return (" bg-(--green) ");
    case "warning":
      return (" bg-(--yellow) ");
    case "critical":
      return (" bg-(--red) ");
    default:
      return (" bg-(--purple) ")
  }
}

export function getRiskLevelColor(risk_level: string) {
  switch (risk_level) {
    case "ok":
      return (" text-(--green) ");
    case "warning":
      return (" text-(--yellow) ");
    case "critical":
      return (" text-(--red) ");
    default:
      return (" text-(--purple) ")
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

export function compareLogin(a: ProfileDashboard, b: ProfileDashboard) {
  return (a.login > b.login);
}

export function compareLevel(a: ProfileDashboard, b: ProfileDashboard) {
  return (a.lvl - b.lvl);
}

export function compareRiskScore(a: ProfileDashboard, b: ProfileDashboard) {
  return (b.risk_score - a.risk_score);
}
