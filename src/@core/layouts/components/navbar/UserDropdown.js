// ** React Imports
// import { Link } from "react-router-dom"

// ** Third Party Components
import {
  User,
  Mail,
  CheckSquare,
  MessageSquare,
  Settings,
  CreditCard,
  HelpCircle,
  Power
} from "react-feather"

// import { CognitoUser } from 'amazon-cognito-identity-js' 
import UserPool from "../../../../UserPool"

// ** Reactstrap Imports
import {
  UncontrolledDropdown,
  DropdownMenu,
  DropdownToggle,
  DropdownItem
} from "reactstrap"

// ** Default Avatar Image
// import defaultAvatar from "@src/assets/images/portrait/small/avatar-s-11.jpg"

const UserDropdown = () => {

  const handleLogout = () => {
    const cognitoUser = UserPool.getCurrentUser()

    if (cognitoUser) {
      cognitoUser.signOut() // Cierra la sesión del usuario

      localStorage.removeItem('sessionToken') // Limpia el token de sesión almacenado

      // Redirige al usuario a la página de inicio de sesión u otra página de tu elección
      window.location.href = '/login' // Cambia '/login' por la ruta deseada
    }
  }

  return (
    <UncontrolledDropdown tag="li" className="dropdown-user nav-item">
      <DropdownToggle
        href="/"
        tag="a"
        className="nav-link dropdown-user-link"
        onClick={(e) => e.preventDefault()}
      >
        <div className="user-nav d-sm-flex d-none">
          {/* <span className="user-name fw-bold">John Doe</span> */}
          <span className="user-name fw-bold">Admin</span>
          {/* <span className="user-status">Admin</span> */}
        </div>
        {/* <Avatar
          img={defaultAvatar}
          imgHeight="40"
          imgWidth="40"
          status="online"
        /> */}
      </DropdownToggle>
      <DropdownMenu end>
        <DropdownItem onClick={handleLogout}>
          <Power size={14} className="me-75" />
          <span className="align-middle">Salir</span>
        </DropdownItem>
      </DropdownMenu>
    </UncontrolledDropdown>
  )
}

export default UserDropdown
