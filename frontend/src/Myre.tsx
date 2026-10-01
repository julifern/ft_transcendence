import { useState, type Dispatch, type SetStateAction } from "react";
import type { MyreAnswer } from "./types/Ai";
import { DynamicTextArea } from "./components/Utils";
import { Papicons } from "@getpapillon/papicons";
import { ModuleMessage } from "./components/Chat";

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

function MyreAnswer({ apiResult, setCanAskQuestion }: { apiResult: MyreAnswer, setCanAskQuestion: Dispatch<SetStateAction<boolean>>}) {
  return (
    <div className="flex flex-col gap-2">
      <ModuleMessage nickname={undefined} msg={apiResult.query} isSender={true} />
      <ModuleMessage nickname={undefined} msg={formatMyreOutput(apiResult)} isSender={false} />
      {
        apiResult.action?.action_type === "add_comment" ?
          <></>
        :
          <></>
      }
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
