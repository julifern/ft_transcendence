import { Papicons } from "@getpapillon/papicons";
// import { useLocation, useParams } from "react-router-dom";
// import { ErrorPage } from "./components/Error";

function TopBarChat() {
  return (
    <>
      <div className="flex felx-rows items-center">
        <Papicons className="h-10 w-10 text-(--text-gray)" name="ArrowLeft" />
        <div className="flex justify-center items-center rounded-full bg-linear-to-r from-(--purple) to-(--bright-purple) w-15 h-15 shrink-0">
          <Papicons className="text-white" name={"GraduationHat"} />
        </div>
        <h1>
          {}
        </h1>
      </div>
    </>
  )
}

export function Chat() {
  // const params = useParams();
  // const location = useLocation();
  
  // if (params.login == undefined)
  //   return (<><ErrorPage /></>);
  // const student = location.state?.student?.login === params.login ? location.state.student : findStudentByLogin(params.login);
  // if (student == undefined)
  //   return (<><ErrorPage /></>);
  return (
    <>
      <TopBarChat />
      <div className="module">
        <p>chat</p>
      </div>
    </>
  );
}
