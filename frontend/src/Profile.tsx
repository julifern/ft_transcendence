import db from './assets/test.json';
import './styles/Profile.css'

import { type objStudent, makeItPrety } from './blueprint/ObjStudent.tsx'
import { ErrorPage } from './blueprint/Error.tsx'

import { useParams } from 'react-router-dom';
import { useLocation } from 'react-router'
import { BtnAddCommit, BtnFollow, BtnIASummarise, BtnSeeMoreCommit, BtnVoirIntra } from './blueprint/Button.tsx';
import { DynamicTextArea } from './blueprint/Utils.tsx';
import { CommitContent, CommitLeaf } from './blueprint/Commit.tsx';
import { InlineIcon } from '@iconify/react';
import { GraphXpOverView } from './blueprint/GraphXpOverView.tsx';
import { BasicContextMenu } from './blueprint/ContextMenu.tsx';

function findStudentByLogin(login: string) : objStudent | undefined {
  return (db.profils.find(tmpLogin => tmpLogin.login === login));
}

function XpOverView() {
  return (
    <>
      <div className="module flex flex-col w-full h-fit gap-2">
        <div className="flex flex-row items-center gap-1">
          <InlineIcon className="h-5 w-5" icon="lucide:chart-line" />
          <h1>XP Overview</h1>
        </div>
        <div className="flex -ml-10 h-50">
          <GraphXpOverView />
        </div>
      </div>
    </>
  );
}

function Summarize() {
  return (
    <>
      <div className="module flex flex-col w-full h-fit gap-2">
        <BtnIASummarise />
        <div className="w-full h-full rounded-3xl bg-(--gray) p-5">
          <DynamicTextArea str="text généré par IA" maxLength={-1} />
        </div>
      </div>
    </>
  );
}

function ProjectOverViewSubmodule({ str }: {str: string}) {
  const grade: number = 67;
  return (
    <>
      <div className="w-full h-fit rounded-xl bg-(--gray) text-(--text-gray) pl-2 pr-2 pb-1 pt-1">
        <div className="flex flex-col items-center gap-1">
          <p className="text-xs">{str}</p>
          <p className="bg-(--purple) text-white rounded-full pl-3 pr-3">{grade}%</p>
        </div>
      </div>
    </>
  );
}

function ProjectOverViewText({descriptor, str} : {descriptor : string, str : string}) {
  return (
    <>
      <div className="flex flex-row items-center gap-1">
        <h1 className="font-bold">{descriptor}</h1>
        <p>{str}</p>
      </div>
    </>
  );
}

function ProjectOverView() {
  return (
    <>
      <div className="module flex flex-col w-full h-fit gap-2">
        <div className="flex flex-col w-full h-fit gap-3">
          <div className="grid grid-flow-col grid-rows-1 md:grid-rows-2 2xl:grid-rows-1 gap-2">
            <ProjectOverViewSubmodule str="Exam 00"/>
            <ProjectOverViewSubmodule str="Exam 01"/>
            <ProjectOverViewSubmodule str="Exam 02"/>
            <ProjectOverViewSubmodule str="Exam 03"/>
          </div>
          <div className="grid grid-flow-col grid-rows-1 md:grid-rows-2 2xl:grid-rows-1 gap-2">
            <ProjectOverViewSubmodule str="Rush 00"/>
            <ProjectOverViewSubmodule str="Rush 01"/>
            <ProjectOverViewSubmodule str="Rush 02"/>
            <ProjectOverViewSubmodule str="Rush 03"/>
          </div>
        </div>
        <div className="flex flex-row h-fit gap-3">
          <div>
            <div className="bg-(--purple) w-1.5 h-full rounded"></div>
          </div>
          <div className="flex flex-col">
            <ProjectOverViewText descriptor="Dernier days:" str="C3"/>
            <ProjectOverViewText descriptor="Enregistré à:" str="C3, C4, Exam2"/>
            <ProjectOverViewText descriptor="Point d'evaluation:" str="3pts"/>
            <ProjectOverViewText descriptor="Niveaux:" str="8.67"/>
            <ProjectOverViewText descriptor="Classement:" str="5eme"/>
          </div>
        </div>
    </div>
    </>
  );
}

function Commit() {
  return (
    <>
      <BasicContextMenu>
        <div className="flex flex-row h-fit">
          <CommitLeaf />
          <CommitContent />
        </div>
      </BasicContextMenu>
    </>
  );
}

function CommitHistory(student: objStudent) {
  return (
    <>
      <div className="module flex flex-col w-full h-fit">
        {/* iter on the first commit */}
        {db.profils.map(item => <Commit key={item.login} />)}
        <div className="flex flex-col lg:flex-row gap-2">
          <BtnAddCommit {...student} />
          <BtnSeeMoreCommit />
        </div>
      </div>
    </>
  );
}

function Description(student: objStudent) {
  let description = student.email;
  if (description == "") {
    description = "Description...";
  }
  return (
     <>
      <div className="module">
        <DynamicTextArea maxLength={-1} str="Description..."/>
      </div>
     </>
   );
}

function StudentProfileTop(student: objStudent) {
  return (
    <>
      <div className="flex flex-col items-center justify-center gap-2">
        <div className="studentCardPp bg-image-item profile-image rounded-full user-image w-45 h-43.75" style={{backgroundImage: "url(" + student.image_url + ")"}}></div>
        <div className="flex flex-col items-center justify-center">
          <h1 className="text-3xl font-semibold">{makeItPrety(student.first_name)} {makeItPrety(student.last_name)}</h1>
          <p className="text-2xl font-normal text-(--text-gray)" >{student.login}</p>
        </div>
      </div>
    </>
  );
}

export function Profile() {
  const params = useParams();
  const location = useLocation();

  if (params.login == undefined)
    return (<><ErrorPage></ErrorPage></>);
  const student = location.state?.student?.login === params.login ? location.state.student : findStudentByLogin(params.login);
  if (student == undefined)
    return (<><ErrorPage></ErrorPage></>);
  return (
    <>
      <StudentProfileTop {...student} />
        <div className="flex flex-row w-full h-fit gap-1.5">
          <BtnVoirIntra {...student} />
          <BtnFollow {...student} />
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-2.5">
          <Description {...student} />
          <CommitHistory {...student} />
          <ProjectOverView />
          <XpOverView />
          <Summarize />
        </div>
      </>
  );
}
