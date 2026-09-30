import { Link } from "react-router-dom";
import { useGetProfilesDashboard } from "./api/ProfilesDashboard";
import { getRiskLevelColor, makeItPrety } from "./components/Utils";
import type { ProfileDashboard } from "./types/ObjStudent";

function TrombiCard({ student }: { student: ProfileDashboard }) {
  return (
    <Link to={`/profile/${student.login}`} className="flex flex-row items-center hover:border-3 hover:border-(--purple) transition-all justify-center rounded-xl overflow-clip">
      <div className={`studentCardTrombi bg-image-item profile-image user-image w-45 h-43.75`} style={{backgroundImage: "url(" + student.image_url + ")"}}></div>
      <div className={`flex flex-col items-center justify-center pt-3.75 w-full h-full`} style={{backgroundColor: `var(${getRiskLevelColor(student.risk_level)})`}}>
        <h1 className="text-2xl font-semibold text-center">{makeItPrety(student.first_name)} {makeItPrety(student.last_name)}</h1>
        <p className="text-xl font-normal text-(--text-gray)" >{student.login}</p>
      </div>
    </Link>
  );
}

export function Trombi() {
  const api = useGetProfilesDashboard();
  if (api.isPending) return <p>Loading...</p>
  if (api.error) return <p>An error has occurred: {api.error.message}</p>
  return (
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
        {
          api.data.profils.map((student) => <TrombiCard key={student.login} student={student}/>)
        }
      </div>
  );
}
