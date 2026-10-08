import { Papicons } from "@getpapillon/papicons";
import { useGetUser } from "./api/get/User";
import { makeItPrety } from "./components/Utils";
import { useGetAccount } from "./api/get/Account";
import { AddWhiteList } from "./components/Button";
import { Dropdown, type MenuProps } from "antd";
import { apiDeleteWhiteListLogin } from "./api/delete/WhiteList";

function AccountTop() {
  const api = useGetUser();
  if (api.isPending) return (<p>Loading...</p>);
  if (api.error) return (<p>An error has occurred: {api.error.message}</p>);
  const student = api.data.user_dict;
  return (
    <>
      <div className="absolute w-full top-0 left-0 right-0 h-50 z-1">
        <div className="studentCardPp w-full h-full" style={{ backgroundImage: `url(${student.image_url})` }}/>
      </div>
      <div className="absolute w-full top-0 left-0 right-0 h-60 z-10 backdrop-blur-xl">
        <div className="w-full h-full bg-linear-to-b from-transparent via-white/50 to-(--bg)" />
      </div>
      <div className="flex flex-col items-center justify-center gap-2 z-20">
        <div className="studentCardPp border border-(--purple) bg-image-item profile-image rounded-full user-image w-45 h-43.75" style={{backgroundImage: "url(" + student.image_url + ")"}}></div>
        <div className="flex flex-col items-center justify-center">
          <h1 className="text-3xl font-semibold">{makeItPrety(student.first_name)} {makeItPrety(student.last_name)}</h1>
          <p className="text-2xl font-normal text-(--text-gray)" >{student.login}</p>
        </div>
      </div>
    </>
  );
}
function WhiteListedLogin({ login }: { login: string }) {
  const items: MenuProps['items'] = [
    {
      label: "Copier",
      key: "cop",
      onClick: () => {navigator.clipboard.writeText(login)},
      icon: <Papicons name="List" />
    },
    {
      label: "Supprimer",
      key: "sup",
      danger: true,
      onClick: () => {apiDeleteWhiteListLogin(login)},
      icon: <Papicons name="Trash" />
    },
  ];
  return (
    <Dropdown menu={{items}} trigger={["contextMenu"]}>
      <p>{login}</p>
    </Dropdown>
  );
}

function AccountWhiteList() {
  const api = useGetAccount();
  if (api.isPending) return (<p>Loading...</p>);
  if (api.error) return (<p>An error has occurred: {api.error.message}</p>);
  return (
    <div className="flex">
      <div className="module flex-col">
        <div className="flex justify-center items-center gap-2">
          <Papicons className="text-xs" name="List" />
          <h1 className="text-2xl">
            White list:
          </h1>
        </div>
        {
          api.data.whitelist.map((login: string) =>
            <WhiteListedLogin key={login} login={login}/>
          )
        }
        <AddWhiteList />
      </div>
    </div>
  );
}

export function Account() {
  return (
    <>
      <AccountTop />
      <AccountWhiteList />
    </>
  );
}
