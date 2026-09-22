import { Papicons } from "@getpapillon/papicons";
import { Dropdown, type MenuProps } from "antd";

export function BasicContextMenu({ children } : {children: React.ReactNode}) {
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
		{children}
    </Dropdown>
  );
}
