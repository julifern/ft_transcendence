import './styles/Profile.css'
import { type Profile } from './types/ObjStudent.ts'
import { type Comment } from './types/Comment.ts';
import { ErrorPage } from './components/Error.tsx'
import { BtnAddCommit, BtnFollow, BtnIASummarise, BtnSeeMoreCommit, BtnVoirIntra } from './components/Button.tsx';
import { DynamicTextArea, makeItPrety } from './components/Utils.tsx';
import { CommitContent, CommitLeaf, EmptyCommit } from './components/Commit.tsx';
import { InlineIcon } from '@iconify/react';
import { GraphXpOverView } from './components/GraphXpOverView.tsx';
import type { Project } from './types/Project.ts';
import { Dropdown } from 'antd';
import { items } from './components/Commit.tsx';
import { useParams } from 'react-router-dom';
import { useGetProfile } from './api/Profile.ts';

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
          <DynamicTextArea name="summarize" str="text généré par IA" maxLength={-1} />
        </div>
      </div>
    </>
  );
}

function ProjectOverViewSubmodule({ str, grade}: {str: string, grade: number | null}) {
  let strGrade;
  if (grade !== null)
    strGrade = grade.toString() + '%';
  else
    strGrade = "...";
  return (
    <>
      <div className="w-full h-fit rounded-xl bg-(--gray) text-(--text-gray) pl-2 pr-2 pb-1 pt-1">
        <div className="flex flex-col items-center gap-1">
          <p className="text-xs">{str}</p>
          <p className="bg-(--purple) text-white rounded-full pl-3 pr-3">{strGrade}</p>
        </div>
      </div>
    </>
  );
}

function ProjectOverViewGrade({projects, name, nb_total_projects}: {projects: Project[], name: string, nb_total_projects: number}) {
  return (
    <>
      {
        Array.from({ length: nb_total_projects }, (_, i) => {
          if (i < projects.length) {
            return (
              <ProjectOverViewSubmodule
                key={i}
                str={name + i}
                grade={projects[projects.length - i - 1].note}
              />
            );
          }
          return (
            <ProjectOverViewSubmodule
              key={i}
              str={name + i}
              grade={null}
            />
          );
        })
      }
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

function ProjectOverView(student: Profile) {
  return (
    <>
      <div className="module flex flex-col w-full h-fit gap-2">
        <div className="flex flex-col w-full h-fit gap-3">
          <div className="grid grid-flow-col grid-rows-1 md:grid-rows-2 2xl:grid-rows-1 gap-2">
            <ProjectOverViewGrade projects={student.exams} name="Exam" nb_total_projects={4} />
          </div>
          <div className="grid grid-flow-col grid-rows-1 md:grid-rows-2 2xl:grid-rows-1 gap-2">
            <ProjectOverViewGrade projects={student.rushs} name="Rush" nb_total_projects={4} />
          </div>
        </div>
        <div className="flex flex-row h-fit gap-3">
          <div>
            <div className="bg-(--purple) w-1.5 h-full rounded"></div>
          </div>
          <div className="flex flex-col">
            <ProjectOverViewText descriptor="Dernier days:" str="TODO"/>
            <ProjectOverViewText descriptor="Enregistré à:" str="TODO"/>
            <ProjectOverViewText descriptor="Point d'evaluation:" str={student.correction_point.toString() + "pts"}/>
            <ProjectOverViewText descriptor="Niveaux:" str={student.lvl.toString()}/>
            <ProjectOverViewText descriptor="Classement:" str="TODO"/>
          </div>
        </div>
    </div>
    </>
  );
}

function Commit({ comment }: {comment: Comment}) {
  return (
    <>
      <Dropdown menu={{items}} trigger={["contextMenu"]}>
        <div className="flex flex-row h-fit">
          <CommitLeaf />
          <CommitContent comment={comment}/>
        </div>
      </Dropdown>
    </>
  );
}

function CommitHistory(student: Profile) {
  const haveCommit = student.comments.length != 0;
  return (
    <>
      <div className="module flex flex-col w-full h-fit">
        {haveCommit ?
          <>
            {student.comments.map((comment, index) => <Commit key={index} comment={comment}/>)}
            <div className="flex flex-col lg:flex-row gap-2">
              <BtnAddCommit {...student} />
              <BtnSeeMoreCommit />
            </div>
          </>
          :
          <EmptyCommit {...student} />
        }
      </div>
    </>
  );
}

function Description(student: Profile) {
  return (
     <>
      <div className="module">
        <DynamicTextArea name="Description" maxLength={-1} str="Description..."/>
      </div>
     </>
   );
}

function StudentProfileTop(student: Profile) {
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
  if (params.login == undefined)
    return (<><ErrorPage></ErrorPage></>);
  const api = useGetProfile(params.login);
  if (api.isPending) {
    return <p>Loading...</p>
  }
  if (api.error) {
    return <p>An error has occurred: {api.error.message}</p>
  }
  const student: Profile = api.data as Profile;
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
          <ProjectOverView {...student} />
          <XpOverView />
          <Summarize />
        </div>
      </>
  );
}
