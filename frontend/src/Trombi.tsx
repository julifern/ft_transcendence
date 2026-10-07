import { useGetProfilesDashboard } from "./api/ProfilesDashboard";
import type { ProfileDashboard } from "./types/ObjStudent";
import { getRiskLevelColorBg, makeItPrety } from "./components/Utils";
import { Link } from "react-router-dom";
import { Papicons } from "@getpapillon/papicons";

function TrombiCard({ student }: { student: ProfileDashboard }) {
  return (
    <Link to={`/profile/${student.login}`} className="flex justify-center items-center bg-(--gray) rounded-xl w-fit h-fit p-1">
      <div className="flex flex-col justify-center items-center bg-(--gray) rounded-xl overflow-clip w-fit h-fit p-1">
        <div className={`flex justify-end studentCardTrombi overflow-hidden bg-image-item profile-image rounded-xl user-image w-35 h-35`} style={{backgroundPosition: "center", backgroundImage: "url(" + student.image_url + ")"}}>
          <Papicons className={`text-white rounded-full m-2 w-5 h-5 ${getRiskLevelColorBg(student.risk_level)}`} name="Alert" />
        </div>
        <h1 className="text-2xl font-semibold text-center">{makeItPrety(student.first_name)}</h1>
        <p className="text-xl font-normal" >{student.login} </p>
      </div>
    </Link>
  );
}
export function Trombi() {
  const api = useGetProfilesDashboard();
  if (api.isPending) return <p>Loading...</p>
  if (api.error) return <p>An error has occurred: {api.error.message}</p>
  return (
      <div className="flex flex-wrap items-center justify-center gap-5">
        {
          api.data.profils.map((student) => <TrombiCard key={student.login} student={student}/>)
        }
      </div>
  );
}
