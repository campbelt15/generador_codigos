import { useSkin } from "@hooks/useSkin"
import { Link, useNavigate } from "react-router-dom"
import InputPasswordToggle from "@components/input-password-toggle"
import {
  Row,
  Col,
  CardTitle,
  Form,
  Label,
  Input,
  Button
} from "reactstrap"
import "@styles/react/pages/page-authentication.scss"
import { useState } from "react"
import UserPool from "../UserPool"
import { AuthenticationDetails, CognitoUser } from "amazon-cognito-identity-js"


const Login = () => {
  const navigate = useNavigate()
  const { skin } = useSkin()
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [error, setError] = useState("")

  const illustration = skin === "dark" ? "login-v2-dark.svg" : "nuestro.svg"
  const source = require(`@src/assets/images/pages/${illustration}`).default

  const handleLogin = (e) => {
    e.preventDefault()
    // Validar campos
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

    const cognitoUser = new CognitoUser(userData)

    cognitoUser.authenticateUser(authenticationDetails, {
      onSuccess: (session) => {
        console.log('Login exitoso', session)

        // Verifica si se requiere una nueva contraseña
        if (session.challengeName === 'NEW_PASSWORD_REQUIRED') {
          // Redirige a la página de cambio de contraseña
          // Puedes manejar la redirección aquí
          navigate('/home')
          console.log('Se requiere una nueva contraseña')
        } else {
          console.log('Redirige a la página de inicio')
          navigate('/home')
        }
      },
      onFailure: (err) => {
        console.error(err)
        setError('Correo o contraseña incorrectos')
      },
      newPasswordRequired: (userAttributes, requiredAttributes) => {
        console.log('Se requiere una nueva contraseña')
        console.log('Atributos del usuario:', userAttributes)
        console.log('Atributos requeridos:', requiredAttributes)
        delete userAttributes.email_verified
        delete userAttributes.email
      
        // Simulación de cambio de contraseña
        const newPassword = '123456789' 
      
        // Completar el cambio de contraseña
        cognitoUser.completeNewPasswordChallenge(newPassword, userAttributes, {
          onSuccess: (session) => {
            console.log('Cambio de contraseña exitoso', session)
            navigate('/home')
          },
          onFailure: (err) => {
            console.error(err)
            setError('Error al cambiar la contraseña')
          }
        })
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
                  onChange={(e) => setPassword(e.target.value)}
                />
              </div>
              {error && <p style={{ color: "red" }}>{error}</p>}
              <Button type="submit" color="secondary" block>
                Ingresar
              </Button>
            </Form>
          </Col>
        </Col>
      </Row>
    </div>
  )
}

export default Login
