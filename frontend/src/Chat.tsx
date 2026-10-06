import { Papicons } from "@getpapillon/papicons";
import { Link, useParams } from "react-router-dom";
import { ErrorPage } from "./components/Error";
import { DynamicTextArea } from "./components/Utils";
import "./styles/Chats.css"
import {useState, useEffect, useRef} from 'react';

function TopBarChat({ title }: { title: string}) {
  return (
    <>
      <div className="ChatModuleHeader flex felx-rows items-center gap-3">
        <Link className="flex felx-rows items-center" to="/chats">
          <Papicons className="h-10 w-10 text-(--text-gray)" name="ArrowLeft" />
          <div className="flex justify-center items-center rounded-full bg-linear-to-r from-(--purple) to-(--bright-purple) w-13 h-13 shrink-0">
            <Papicons className="text-white" name={"GraduationHat"} />
          </div>
        </Link>
        <h1>
          {title}
        </h1>
      </div>
    </>
  )
}

function ChatHeader({title, description}: {title: string, description: string}) {
  return (
    <>
      <div className="module flex flex-col w-fit items-center">
        <h1 className="font-bold">
          {title}
        </h1>
        <p className="text-(--text-gray)">
          {description}
        </p>
      </div>
    </>
  );
}

function ModuleMessage({nickname, msg, isSender}: {nickname: string, msg: string, isSender: boolean}) {
  const isSenderCssRenderModule: string = isSender ? " moduleMessage moduleSenderMessage " : " moduleMessage moduleReceiverMessage ";
  const msgPosition: string = isSender ? " justify-end " : " justify-start "  
  return (
    <>
      <div className={"flex " + msgPosition}>
        <div className={isSenderCssRenderModule +" flex flex-col"}>
          <div className={"flex " + msgPosition}>
            <p className="font-bold">{nickname}</p>
          </div>
          <div className="bg-[#E6E6E6] w-ful h-0.5"></div>
          <p>{msg}</p>
        </div>
      </div>
    </>
  );
}

function sendMsg(text: string, ws: WebSocket) {
  ws.send(
    JSON.stringify({
      message: text,
    })
  );
}

export function Chat() {
  const params = useParams();
  // const location = useLocation();
  const [msg, setMsg] = useState("");
  
  if (params.title == undefined)
    return (<><ErrorPage /></>);
  const title: string = params.title;

  const socket = useRef<WebSocket | null>(null);

  useEffect(() => {
    if (!params.title)
      return;
    const ws = new WebSocket(
      `wss://${window.location.host}/ws/chat/${title}/`
    );
    socket.current = ws;

    ws.onopen = () => {
      console.log("WebSocket Opened");
    };

    ws.onclose = (event: Event) => {
      console.log("WebSocket Closed:", event.code, event.reason);
    };

    ws.onerror = (event: Event) => {
      console.log("Error:", event);
    };

    ws.onmessage = (event: Event) => {
      const data = JSON.parse(event.data);
      console.log("Message:", data);
    };

    return () => {
      ws.close();
    };
  }, []);

  return (
    <>
    <div className="flex flex-col">
      <TopBarChat title={title}/>
      <div className="ChatModule flex flex-col gap-2">
        <div className="flex w-full items-center justify-center">
          <ChatHeader title={title} description={"description complete"} />
        </div>
        <ModuleMessage nickname={"mcolin"} msg={"hellow! Comment tu vas?!"} isSender={true} />
        <ModuleMessage nickname={"etoad"}  msg={"67!!!"} isSender={false} />
        <ModuleMessage nickname={"etoad"}  msg={"Je suis un texte très long pour regarder comment les modules de message réagissent à ce genre de situation et voir si le responsive ne casse pas, j'espère que cela ne va rien casser. PS : free(C), j'ai le putain de web!!!"} isSender={false} />
      </div>
    </div>
      <div className="module flex flex-col w-full h-fit gap-2">
        <div className="flex flex-rows h-full w-full g-3">
          <DynamicTextArea placeholder={"Message"} defaultValue={""} maxLength={-1} onChange={(e) => {setMsg(e.target.value)}}/>
          <button onClick={() => sendMsg(msg, socket.current)} className="w-fit h-fit rounded-full p-3 bg-(--purple)">
            <Papicons className="h-7 w-7 text-white" name="ArrowRight" />
          </button>
        </div>
      </div>
    </>
  );
}
