

function ModuleMessageNickName({nickname, msgPosition}: {nickname: string, msgPosition: string}) {
  return (
    <>
      <div className={"flex " + msgPosition}>
         <p className="font-bold">{nickname}</p>
       </div>
       <div className="bg-[#E6E6E6] w-ful h-0.5"></div>
    </>
  );
}

export function ModuleMessage({nickname, msg, isSender}: {nickname: string | undefined, msg: string, isSender: boolean}) {
  const isSenderCssRenderModule: string = isSender ? " moduleMessage moduleSenderMessage " : " moduleMessage moduleReceiverMessage ";
  const msgPosition: string = isSender ? " justify-end " : " justify-start "
  console.log(msg)
  return (
    <>
      <div className={"flex " + msgPosition}>
        <div className={isSenderCssRenderModule +" flex flex-col"}>
          { nickname === undefined ? <></> : <ModuleMessageNickName nickname={nickname} msgPosition={msgPosition}/> }
          <h1>{msg}</h1>
        </div>
      </div>
    </>
  );
}
