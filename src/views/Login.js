import { useSkin } from "@hooks/useSkin"
import { Link } from "react-router-dom"
import { Facebook, Twitter, Mail, GitHub } from "react-feather"
import InputPasswordToggle from "@components/input-password-toggle"
import {
  Row,
  Col,
  CardTitle,
  CardText,
  Form,
  Label,
  Input,
  Button
} from "reactstrap"
import "@styles/react/pages/page-authentication.scss"

const Login = () => {
  const { skin } = useSkin()

  const illustration = skin === "dark" ? "login-v2-dark.svg" : "nuestro.svg",
    source = require(`@src/assets/images/pages/${illustration}`).default

  return (
    <div className="auth-wrapper auth-cover" style={{ backgroundColor: '#1274c5' }}>
      <Row className="auth-inner m-0">
        <Link className="brand-logo" to="/" onClick={(e) => e.preventDefault()}>

          
        </Link>
        <Col className="d-none d-lg-flex align-items-center p-5" lg="8" sm="12">
          <div className="w-100 d-lg-flex align-items-center justify-content-center px-5">
            <img className="img-fluid" src={source} alt="Login Cover" />
          </div>
        </Col>
        <Col
          className="d-flex align-items-center auth-bg px-2 p-lg-5"
          lg="4"
          sm="12"
        >
          <Col className="px-xl-2 mx-auto" sm="8" md="6" lg="12">
            <CardTitle tag="h2" className="fw-bold mb-1">
              Generador de Código
            </CardTitle>

            <Form
              className="auth-login-form mt-2"
              onSubmit={(e) => e.preventDefault()}
            >
              <div className="mb-1">
                <Label className="form-label" for="login-email">
                  Correo
                </Label>
                <Input
                  type="email"
                  id="login-email"
                  placeholder="john@nuestrodiario.com.gt"
                  autoFocus
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
                />
              </div>
    
              <Button tag={Link} to="/" color="secondary" block>
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
