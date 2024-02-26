import { useSkin } from "@hooks/useSkin"
import ObtenerIP from "../@core/components/Ip_user/ObtenerIp"
import UserLogs from "../@core/components/logs_user/UserLogs"
import { Link, useNavigate } from "react-router-dom"
import InputPasswordToggle from "@components/input-password-toggle"
import {
  Row,
  Col,
  CardTitle,
  Form,
  Label,
  Input,
  Button,
  Modal, ModalHeader, ModalBody, ModalFooter
} from "reactstrap"
import 'bootstrap/dist/css/bootstrap.min.css'
import "@styles/react/pages/page-authentication.scss"
import { useState } from "react"
import UserPool from "../UserPool"
import { AuthenticationDetails, CognitoUser } from "amazon-cognito-identity-js"


const Login = () => {
  const navigate = useNavigate()
  const { skin } = useSkin()
  const [email, setEmail] = useState("")
  const [name, setName] = useState('')
  const [password, setPassword] = useState("")
  const [error, setError] = useState("")
  const [errorName, setErrorName] = useState("")
  const [passwordChangeError, setPasswordChangeError] = useState("")
  const [newPassword, setNewPassword] = useState('')
  const [showModal, setShowModal] = useState(false)
  const [cognitoUser, setCognitoUser] = useState(null)
  const [userAttributes, setUserAttributes] = useState(null)

  const illustration = skin === "dark" ? "nuestro.svg" : "nuestro.svg"
  const source = require(`@src/assets/images/pages/${illustration}`).default

  const handleNewPassword = () => {
    if (!name.trim()) {
      setErrorName("Por favor, ingresa tu nombre.")
      return
    }
    setErrorName("")
    const updatedUserAttributes = {
      ...userAttributes,
      name
    }
  
    // Elimina atributos de solo lectura
    delete updatedUserAttributes.email_verified
    delete updatedUserAttributes.email
    // Otros atributos de solo lectura pueden ser eliminados aquí si es necesario
  
    cognitoUser.completeNewPasswordChallenge(newPassword, updatedUserAttributes, {
      onSuccess: async (session) => {
        setShowModal(false)
        localStorage.setItem('sessionToken', session.getIdToken().getJwtToken())
        localStorage.setItem('userEmail', email)
        localStorage.setItem('userName', name)

        const ipCliente = await ObtenerIP() 

        await UserLogs('Login', 'Login', ipCliente, email)

        if (ipCliente) {
          localStorage.setItem('userIP', ipCliente) 
        }

        navigate('/home')
      },
      onFailure: (err) => {
        console.error(err)
        setPasswordChangeError(err.message || 'Error al cambiar la contraseña')
      }
    })
  }
  
  const handleLogin = (e) => {
    e.preventDefault()
    if (!email || !password) {
      setError("Por favor, completa todos los campos")
      return
    }

    const authenticationData = {
      Username: email,
      Password: password
    }

    const authenticationDetails = new AuthenticationDetails(authenticationData)
    const userData = {
      Username: email,
      Pool: UserPool
    }

    const newUser = new CognitoUser(userData)
    setCognitoUser(newUser)

    newUser.authenticateUser(authenticationDetails, {
      onSuccess: async (session) => {
        localStorage.setItem('sessionToken', session.getIdToken().getJwtToken()) 
        localStorage.setItem('userEmail', email)
        localStorage.setItem('userName', session.getIdToken().decodePayload().name)

        const ipCliente = await ObtenerIP() 

        await UserLogs('Login', 'Login', ipCliente, email)

        if (ipCliente) {
          localStorage.setItem('userIP', ipCliente) 
        }

        navigate('/home')
      },
      onFailure: (err) => {
        console.error(err)
        setError('Correo o contraseña incorrectos')
      },
      newPasswordRequired: (userAttrs) => {
        setUserAttributes(userAttrs)
        setShowModal(true)
      }
    })
  }


  return (
    <div className="auth-wrapper auth-cover" style={{ backgroundColor: '#1274c5' }}>
      <Row className="auth-inner m-0">
        <Link className="brand-logo" to="/" onClick={(e) => e.preventDefault()}></Link>
        <Col className="d-none d-lg-flex align-items-center p-5" lg="8" sm="12">
          <div className="w-100 d-lg-flex align-items-center justify-content-center px-5">
            <img className="img-fluid" src={source} alt="Login Cover" />
          </div>
        </Col>
        <Col className="d-flex align-items-center auth-bg px-2 p-lg-5" lg="4" sm="12">
          <Col className="px-xl-2 mx-auto" sm="8" md="6" lg="12">
            <CardTitle tag="h2" className="fw-bold mb-1">
              Iniciar Sesión
            </CardTitle>
            <Form className="auth-login-form mt-2" onSubmit={handleLogin}>
              <div className="mb-1">
                <Label className="form-label" for="login-email">
                  Correo
                </Label>
                <Input
                  type="email"
                  id="login-email"
                  placeholder="john@nuestrodiario.com.gt"
                  autoFocus
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                />
              </div>
              <div className="mb-1">
                <div className="d-flex justify-content-between">
                  <Label className="form-label" for="login-password">
                    Password
                  </Label>
                </div>
                <InputPasswordToggle
                  className="input-group-merge"
                  id="login-password"
                  placeholder="********"
                  value={password}
                  onChange={(event) => {
                    const input = event.target.value
                    const regex = /^\S*$/ 
                    if (regex.test(input)) {
                      setPassword(input)
                    }
                  }}
                />
              </div>
              {error && <p style={{ color: "red" }}>{error}</p>}
              <Button className="mt-3" type="submit" color="primary" block>
                Ingresar
              </Button>
            </Form>
            {/* <Button color="link" onClick={() => showForgotPassword()}>¿Olvidaste tu contraseña?</Button> */}
            <Link to="/forgot-password" className="btn btn-link">¿Olvidaste tu contraseña?</Link>

          </Col>
        </Col>
      </Row>

      <Modal isOpen={showModal} toggle={() => setShowModal(false)}>
        <ModalHeader toggle={() => setShowModal(false)}>Cambio de Contraseña Requerido</ModalHeader>
        <ModalBody>
        <p>Por favor, ingresa tu nombre.</p>
        <Input
          type="text"
          placeholder="Nombre"
          value={name}
          onChange={(e) => {
            const input = e.target.value
            // Esta expresión regular permite letras y espacios
            const regex = /^[a-zA-Z ]*$/
            if (regex.test(input)) {
              setName(input)
            }
          }}
        />
          {errorName && (
            <div style={{ color: "red" }} className="px-3">
              <p>{errorName}</p>
            </div>
          )}
          <p>Por favor, ingresa tu nueva contraseña.</p>
          <InputPasswordToggle
                  className="input-group-merge"
                  id="login-password"
                  placeholder="********"
                  value={newPassword}
                  onChange={(event) => {
                    const input = event.target.value
                    const regex = /^\S*$/ 
                    if (regex.test(input)) {
                      setNewPassword(input)
                    }
                  }}
                />
        </ModalBody>
        {passwordChangeError && (
            <div style={{ color: "red" }} className="px-3">
              <p>Debe contener un mínimo de 8 caracteres, 1 número, 1 letra minúscula, 1 letra mayúscula y 1 carácter especial</p>
            </div>
          )}
        <ModalFooter>
          <Button color="primary" onClick={handleNewPassword}>Actualizar Contraseña</Button>
          <Button color="secondary" onClick={() => setShowModal(false)}>Cancelar</Button>
        </ModalFooter>
      </Modal>
    </div>
  )
}

export default Login
