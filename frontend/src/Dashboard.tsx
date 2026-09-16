import { type objStudent, makeItPrety } from './blueprint/ObjStudent.tsx'
import './styles/Dashboard.css'
import './styles/color.css'
import { Link } from 'react-router-dom';
import { Dropdown, type MenuProps } from "antd";
import db from './assets/test.json';

import { InlineIcon } from '@iconify/react';
import { Papicons } from '@getpapillon/papicons';
import { BtnAddCommit, BtnVoirIntra } from './blueprint/Button.tsx';
import { CommitContent, CommitLeaf } from './blueprint/Commit.tsx';


function StudentCardEmptyCommit(student: objStudent) {
  return (
    <>
      <div className="flex flex-col items-center justify-center w-full h-full gap-1.25">
        <Papicons className="w-15 h-15 text-(--text-gray)" name="Ghost" />
        <h1>
          Aucune activité
        </h1>
        <div className="flex flex-col w-full h-fit gap-1.5">
          <BtnAddCommit {...student} />
          <BtnVoirIntra {...student} />
        </div>
      </div>
    </>
  );
}

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

function StudentCard(student: objStudent) {
  const haveCommit = true;
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
          <Link className="flex items-center justify-center rounded-full w-15 h-13.75 shrink-0" style={{backgroundColor: "var(--gray)"}} to={"/profile/" + student.login} state={student}><InlineIcon icon="akar-icons:more-horizontal" /></Link>
        </div>
        {
          haveCommit ?
            // iter on the first commit of student.
            <div>
              <StudentCardCommit></StudentCardCommit>
              <StudentCardCommit></StudentCardCommit>
              <StudentCardCommit></StudentCardCommit>
            </div>
            :
            <StudentCardEmptyCommit {...student} ></StudentCardEmptyCommit>
        }

      </div>
    </>
  )
}

function StudentsCards({isFollowed}: {isFollowed: boolean}) {

  const titel: string = isFollowed ? "Tes suivies" : "Tous";

  return (
    <>
      <div className="studentsCardFollows flex flex-col gap-2.5">
        <p className="font-regular text-1xl text-(--text-gray)">{titel}</p>
        <div className="grid grid-cols-1 md:grid-cols-3 mg:grid-cols-6 gap-2.5">
            {db.profils.map(item => <StudentCard key={item.login} {...item} />)}
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
      <StudentsCards isFollowed={true}></StudentsCards>
      <StudentsCards isFollowed={false}></StudentsCards>
    </>
  )
}
