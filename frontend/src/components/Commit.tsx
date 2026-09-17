import { Papicons } from "@getpapillon/papicons"

export function CommitLeaf() {
  return (
    <>
      <div className="flex flex-col items-center justify-center" style={{marginTop: "-2px"}}>
        <div className="w-2.5 h-2.5 rounded-full bg-(--purple) shrink-0"></div>
        <div className="flex w-1 h-full" style={{backgroundColor: "var(--purple)", marginTop: "-2px"}}></div>
        <div className="w-1 h-1 rounded-full bg-(--purple) shrink-0" style={{marginTop: "-2px"}}></div>
      </div>
    </>
  )
}

export function CommitContent() {
  const isNewCommit = true;
  return (
      <>
        <div className="flex flex-col w-full h-fit gap-0.75">
          {isNewCommit ? <p className="w-fit h-fit rounded-full pl-3 pr-3 text-white text-[10px] bg-(--purple)">Nouveau</p> : <></>}
          <h1>
            il se chie dessus
          </h1>
          <div className="flex flex-row items-center gap-1 pb-1">
            <Papicons className="text-(--text-gray) w-4 h-4" name="PenAlt" />
            <p className="text-[12px] text-(--text-gray)">
              yben-dje - hier
            </p>
          </div>
        </div>
      </>
  )
}
