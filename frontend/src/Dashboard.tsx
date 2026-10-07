import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { InlineIcon } from '@iconify/react';

import './styles/Dashboard.css'
import './styles/color.css'

import { type ProfileDashboard } from './types/ObjStudent.ts'

import { Commit, EmptyCommit } from './components/Commit.tsx';
import { compareLevel, compareLogin, compareRiskScore, getRiskLevelColor, isFollowed, makeItPrety } from './components/Utils.tsx';
import { useGetProfilesDashboard } from './api/ProfilesDashboard.ts';
import { useGetUser } from './api/User.ts';
import { BtnAddCommit, BtnVoirIntra, FilterBtn } from './components/Button.tsx';

function StudentCard({student}: {student : ProfileDashboard}) {
  const haveCommit = student.comments.length != 0;
  return (
    <>
      <div className="studentCard flex flex-col p-2.5 gap-2.5">
        <div className="studentCardTopBar">
          <div className="studentCardPp bg-image-item profile-image rounded-full user-image w-15 h-13.75 shrink-0" style={{backgroundImage: "url(" + student.image_url + ")"}}></div>
          <div className="w-full">
            <p className="text-1xl">
              {makeItPrety(student.first_name)}
            </p>
            <p>
              {makeItPrety(student.last_name)} ({student.login})
            </p>
          </div>
          <p className={`rounded-full border border-solid pl-1.5 pr-1.5 pt-1 pb-1 ${getRiskLevelColor(student.risk_level)}`}>
            {student.risk_level}
          </p>
          <Link className="flex items-center justify-center rounded-full w-15 h-13.75 shrink-0" style={{backgroundColor: "var(--gray)"}} to={"/profile/" + student.login} ><InlineIcon icon="akar-icons:more-horizontal" /></Link>
        </div>
        {
          haveCommit ?
            <>
              <Commit comment={student.comments[0]} login={student.login}/>
              <div className="flex flex-col w-full h-full justify-end gap-1.5">
                <BtnAddCommit {...student} />
                <BtnVoirIntra {...student} />
              </div>
            </>
            :
            <EmptyCommit {...student} />
        }
      </div>
    </>
  )
}


function sortListStudentsCards(profils: ProfileDashboard[], sortType: number) {
  let fn: ((a: ProfileDashboard, b: ProfileDashboard) => any) | undefined = undefined;
  switch (sortType) {
    case 0: // lvl
      fn = compareLevel;
      break; 
      case 1: // risk
      fn = compareRiskScore;
      break ;
    case 2:
      fn = compareLogin;
      break ;
    default:
      fn = compareLevel;
  }
  if (fn) {
    console.log("element sorted");
    profils.sort(fn);
  }
  return (profils);
}

function ListStudentsCards({inputSearchBar, followedOnly, poolIdx, sortType}: {inputSearchBar: string, followedOnly: boolean, poolIdx: number, sortType: number}) {
  const api = useGetProfilesDashboard(poolIdx);
  const title: string = followedOnly ? "Tes suivis" : "Tous"
  let filterData;
  if (followedOnly) {
    const apiUser = useGetUser();
    if (api.isPending || apiUser.isPending) return <p>Loading...</p>
    if (api.error) return <p>An error has occurred: {api.error.message}</p>
    if (apiUser.error) return <p>An error has occurred: {apiUser.error.message}</p>
    filterData = api.data.profils.filter((el) => {
    if (isFollowed(el.login, apiUser.data))
      return (el);
    });
  } else {
    if (api.isPending) return <p>Loading...</p>
    if (api.error) return <p>An error has occurred: {api.error.message}</p>
    api.data.profils = sortListStudentsCards(api.data.profils, sortType);
    filterData = api.data.profils.filter((el) => {
      if (inputSearchBar === "")
        return (el);
      else
        return (el.login.toLocaleLowerCase().includes(inputSearchBar)
                || el.first_name.toLocaleLowerCase().includes(inputSearchBar));
    });
  }
  if (!filterData.length)
    return (<></>);
  return (
    <>
      <p className="font-regular text-1xl text-(--text-gray)">{title}</p>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-2.5">
        {filterData.map((ProfileDashboard: ProfileDashboard) => (<StudentCard key={ProfileDashboard.login} student={ProfileDashboard} />))}
      </div>
    </>
  );
}

function StudentsCards({inputSearchBar, followedOnly, poolIdx, sortType}: {inputSearchBar: string, followedOnly: boolean, poolIdx: number, sortType: number}) {
  return (
    <>
      <div className="studentsCardFollows flex flex-col gap-2.5">
        <ListStudentsCards inputSearchBar={inputSearchBar} followedOnly={followedOnly} poolIdx={poolIdx} sortType={sortType}/>
      </div>
    </>
  );
}

export function Dashboard() {
  const [studentsfilter, setstudentsfilter] = useState("");
  const [poolIdx, setPoolIdx] = useState(() => {
    return (Number(localStorage.getItem("poolIdx") ?? 0));
  });
  const [sortType, setSortType] = useState(() => {
    return (Number(localStorage.getItem("sortType") ?? 0))
  });
  useEffect(() => {
    console.log("change!!!");
    localStorage.setItem("poolIdx", poolIdx.toString());
  }, [poolIdx]);
  useEffect(() => {
    console.log("change!!!");
    localStorage.setItem("sortType", sortType.toString());
  }, [sortType]);
  return (
    <>
      <div className="dashboardSearch gap-5">
        <p className="font-semibold text-2xl pl-3">Students</p>
        <div className="flex flex-row dashboardSearchProfile">
          <input className="w-full outline-0 indent-2.5" onChange={(e) => {setstudentsfilter(e.target.value)}} type="text" placeholder="Rechercher un student" />
          <FilterBtn setPoolIdx={setPoolIdx} setSortType={setSortType} poolIdx={poolIdx} sortType={sortType} />
        </div>
      </div>
      <StudentsCards inputSearchBar={""} followedOnly={true} poolIdx={poolIdx} sortType={sortType}/>
      <StudentsCards inputSearchBar={studentsfilter} followedOnly={false} poolIdx={poolIdx} sortType={sortType}/>
    </>
  )
} 