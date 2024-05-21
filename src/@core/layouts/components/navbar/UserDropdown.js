import UserLogs from "../../../components/logs_user/UserLogs"

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
  const userName_sin_formato = localStorage.getItem('userName') || ''
  const userEmail = localStorage.getItem('userEmail')
  const userIP = localStorage.getItem('userIP')

  //funcion para formatear el nombre
  function capitalize(str) {
    return str
      .toLowerCase()
      .split(' ')
      .map(word => word.charAt(0).toUpperCase() + word.slice(1))
      .join(' ')
  }
  
  const userName = capitalize(userName_sin_formato)

  const handleLogout = () => {
    const cognitoUser = UserPool.getCurrentUser()
    
    UserLogs('Logout', '', 'Logout', userIP, userEmail)

    if (cognitoUser) {
      cognitoUser.signOut() // Cierra la sesión del usuario

      localStorage.removeItem('sessionToken') 
      localStorage.removeItem('userEmail') 
      localStorage.removeItem('userIP') 
      localStorage.removeItem('userName') 

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
          <span className="user-name fw-bold">{userName}</span>
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
