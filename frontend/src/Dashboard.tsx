import { type ProfilesDashboard, type ProfileDashboard } from './types/ObjStudent.ts'
import { type Comment } from './types/Comment.ts';
import './styles/Dashboard.css'
import './styles/color.css'
import { Link } from 'react-router-dom';
import { Dropdown, type MenuProps } from "antd";

import { InlineIcon } from '@iconify/react';
import { Papicons } from '@getpapillon/papicons';
import { CommitContent, CommitLeaf, EmptyCommit } from './components/Commit.tsx';
import { isFollowed, makeItPrety } from './components/Utils.tsx';
import { useGetProfilesDashboard } from './api/ProfilesDashboard.ts';
import { useState } from 'react';
import { useGetUser } from './api/User.ts';
import type { User } from './types/User.ts';
import type { UseQueryResult } from '@tanstack/react-query';

function StudentCardCommit({ comments }: { comments: Comment[]}) {
  const items: MenuProps['items'] = [
    {
      label: "Copier",
      key: "cop",
      onClick: () => {alert("cop")},
      icon: <Papicons name="List" />
    },
    {
      label: "Modifier",
      key: "mod",
      onClick: () => {alert("mod")},
      icon: <Papicons name="PenAlt" />
    },
    {
      label: "Supprimer",
      key: "sup",
      danger: true,
      onClick: () => {alert("sup")},
      icon: <Papicons name="Trash" />
    },
  ];
  return (
    <Dropdown menu={{items}} trigger={["contextMenu"]}>
        <div className="flex flex-row h-fit">
          <CommitLeaf />
          <CommitContent comment={comments[comments.length - 1]}/>
        </div>
    </Dropdown> 
  );
}

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
          {/* student={student} */}
          <Link className="flex items-center justify-center rounded-full w-15 h-13.75 shrink-0" style={{backgroundColor: "var(--gray)"}} to={"/profile/" + student.login} ><InlineIcon icon="akar-icons:more-horizontal" /></Link>
        </div>
        {
          haveCommit ?
            // iter on the first commit of student.
            <div>
              <StudentCardCommit comments={student.comments} />
            </div>
            :
            <EmptyCommit {...student} />
        }
      </div>
    </>
  )
}

function ListStudentsCards({inputSearchBar, followedOnly}: {inputSearchBar: string, followedOnly: boolean}) {
  const api = useGetProfilesDashboard();
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
    filterData = api.data.profils.filter((el) => {
      if (inputSearchBar === "")
        return (el);
      else
        return (el.login.toLocaleLowerCase().includes(inputSearchBar));
    });
  }
  if (!filterData.length)
    return (<></>);
  return (
    <>
      <p className="font-regular text-1xl text-(--text-gray)">{title}</p>
      <div className="grid grid-cols-1 md:grid-cols-3 mg:grid-cols-6 gap-2.5">
        {filterData.map((ProfileDashboard: ProfileDashboard) => (<StudentCard key={ProfileDashboard.login} student={ProfileDashboard} />))}
      </div>
    </>
  );
}

function StudentsCards({inputSearchBar, followedOnly}: {inputSearchBar: string, followedOnly: boolean}) {
  return (
    <>
      <div className="studentsCardFollows flex flex-col gap-2.5">
        <ListStudentsCards inputSearchBar={inputSearchBar} followedOnly={followedOnly} />
      </div>
    </>
  );
}

export function Dashboard() {
  const [studentsfilter, setstudentsfilter] = useState("");
  return (
    <>
      <div className="dashboardSearch gap-5">
        <p className="font-semibold text-2xl pl-3">Students</p>
        <input value={studentsfilter} onChange={(e) => {setstudentsfilter(e.target.value)}} className="dashboardSearchProfile" type="text" placeholder="Rechercher un student" />
      </div>
      <StudentsCards inputSearchBar={""} followedOnly={true}/>
      <StudentsCards inputSearchBar={studentsfilter} followedOnly={false}/>
    </>
  )
} 