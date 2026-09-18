import { type profile, type profiles } from './types/ObjStudent.ts'
import './styles/Dashboard.css'
import './styles/color.css'
import { Link } from 'react-router-dom';
import { Dropdown, type MenuProps } from "antd";

import { InlineIcon } from '@iconify/react';
import { Papicons } from '@getpapillon/papicons';
import { CommitContent, CommitLeaf, EmptyCommit } from './components/Commit.tsx';
import { useQuery, type UseQueryResult } from '@tanstack/react-query';
import { makeItPrety } from './components/Utils.tsx';
import { getProfilscacheName, getProfilsHook } from './api/Profiles.ts';

function StudentCardCommit() {
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
          <CommitContent />
        </div>
    </Dropdown>
  );
}

function StudentCard({student}: {student : profile}) {
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
              <StudentCardCommit />
              <StudentCardCommit />
              <StudentCardCommit />
            </div>
            :
            <EmptyCommit {...student} />
        }
      </div>
    </>
  )
}

function StudentsCards() {
  // const titel: string = isFollowed ? "Tes suivies" : "Tous";
  const titel: string = false ? "Tes suivies" : "Tous";
  const api: UseQueryResult = useQuery({queryKey: getProfilscacheName, queryFn: getProfilsHook});
  const data: profiles = api.data as profiles;
  if (api.isPending) {
    return <p>Loading...</p>
  }
  if (api.error) {
    return <p>An error has occurred: {api.error.message}</p>
  }
  return (
    <>
      <div className="studentsCardFollows flex flex-col gap-2.5">
        <p className="font-regular text-1xl text-(--text-gray)">{titel}</p>
        <div className="grid grid-cols-1 md:grid-cols-3 mg:grid-cols-6 gap-2.5">
            {data.profils.map((profil: profile) => (<StudentCard key={profil.id} student={profil} />))}
        </div>
      </div>
    </>
  );
}

export function Dashboard() {
  return (
    <>
      <div className="dashboardSearch gap-5">
        <p className="font-semibold text-2xl pl-3">Students</p>
        <input className="dashboardSearchProfile" type="text" placeholder="Rechercher un student" />
      </div>
      <StudentsCards></StudentsCards>
    </>
  )
}
