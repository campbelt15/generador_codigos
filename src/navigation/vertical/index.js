import { Archive, Home, Users, List } from "react-feather"

export default [
  {
    id: "home",
    title: "Generador",
    icon: <Home size={20} />,
    navLink: "/home"
  },
  {
    id: "codigos",
    title: "Codigos",
    icon: <Archive size={20} />,
    navLink: "/codigos"
  },
  {
    id: "anulaciones",
    title: "Anulaciones",
    icon: <List size={20} />,
    navLink: "/anulaciones"
  }
]
