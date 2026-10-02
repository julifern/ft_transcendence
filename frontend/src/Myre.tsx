import { useState, type Dispatch, type SetStateAction } from "react";
import type { MyreAnswer } from "./types/Ai";
import { DynamicTextArea } from "./components/Utils";
import { Papicons } from "@getpapillon/papicons";
import { ModuleMessage } from "./components/Chat";
import { SendCommit } from "./components/Button";

function formatMyreOutput(apiResult: MyreAnswer) : string {
  let result: string = apiResult.answer;
  if (apiResult.sources.length) {
    result += "\nSources:";
    apiResult.sources.map((src) => {
      result += "\n- " + src;
    })
  }
  return (result);
}

function MyreAction({apiResult}: {apiResult: MyreAnswer}) {
  const [commitSended, setCommitSended] = useState(false);
  if (apiResult.action?.action_type !== "add_comment")
    return (null);
  return (
    <div className="relative overflow-hidden">
      <div className={`justify-end items-end transition-all duration-500 ease-in-out ${commitSended ? "opacity-0 translate-y-2 pointer-events-none" : "opacity-100 translate-y-0"}`}>
        <SendCommit login={apiResult.action.target_login} onChange={() => setCommitSended(true)} commitContent={apiResult.action.suggested_text} close={undefined}/>
      </div>
    </div>
  );
}

function MyreAnswer({ apiResult, setCanAskQuestion }: { apiResult: MyreAnswer, setCanAskQuestion: Dispatch<SetStateAction<boolean>>}) {
  return (
    <div className="flex flex-col gap-2">
      <ModuleMessage nickname={undefined} msg={apiResult.query} isSender={true} />
      <div className="typewriter">
        <ModuleMessage nickname={undefined} msg={formatMyreOutput(apiResult)} isSender={false} />
      </div>
      <MyreAction apiResult={apiResult}/>
      <button className="w-full bg-(--purple) rounded-full" onClick={() => setCanAskQuestion(true)}>
        <h1 className="text-white text-xl">
          Supprimer le chat
        </h1>
      </button>
    </div>
  );
}

export function Myre() {
  const [myreRequest, setMyreRequest] = useState("");
  const [canAskQuestion, setCanAskQuestion] = useState(true);
  const [apiResult, setApiResult] = useState<MyreAnswer>({query: "", answer: "", action: null, sources: []});
  function sendQueryToMyre(query: string) : MyreAnswer {
    setCanAskQuestion(false);
    // const api = useGetMyreAnswer(query);
    // if (api.isPending) return (apiResult);
    // if (api.error) return (apiResult);
    // return (api.data)
    return ({
      query: query,
      answer: "answer",
      action: {
      action_type: "add_comment",
      target_login: "cagermai",
      suggested_text: "commit from Myre."
      },
      sources: ["wiki", "42sh"]
    })
  }
  return (
  <>
    <div className="module flex flex-col w-full h-fit gap-2">
    <div className="w-full h-full rounded-3xl bg-(--gray) p-5">
    {
      canAskQuestion ?
        <div className="flex flex-rows h-full w-full g-3">
        <DynamicTextArea placeholder="Demande à Myre" defaultValue={myreRequest} maxLength={-1} onChange={(e) => setMyreRequest(e.target.value)}/>
        <button onClick={() => {if (myreRequest) setApiResult(sendQueryToMyre(myreRequest))}} className="w-fit h-fit rounded-full p-3 bg-(--purple)">
          <Papicons className="h-7 w-7 text-white" name="ArrowRight" />
        </button>
        </div>
      :
        <MyreAnswer apiResult={apiResult} setCanAskQuestion={setCanAskQuestion}/>
    }
    </div>
    </div>
  </>
  );
}
