import { useState } from 'react'
import InputPasswordToggle from "@components/input-password-toggle"
// import './styles/stylesH.css'
import { Button, CardImg, CardText, CardTitle, Col, Form, Input, Label, Row } from 'reactstrap'
import "@styles/react/pages/page-authentication.scss"
// import { Auth } from 'aws-amplify';
import Swal from 'sweetalert2'
import { useNavigate } from 'react-router-dom'
import UserPool from "../UserPool"
import { CognitoUser } from "amazon-cognito-identity-js"

const ForgotPassword = () => {
    const [email, setEmail] = useState('')
    const [code, setCode] = useState('')
    const [sendCode, setSendCode] = useState(false)

    const [newPassword, setNewPassword] = useState('')
    const [newPasswordV, setNewPasswordV] = useState('')
    const navigate = useNavigate()
    const LogoND = require(`@src/assets/images/pages/nuestro.svg`).default

// ------- Validacion de Campos y tamaño de texto -------
    const validCampos = newPassword.trim() !== '' && newPasswordV.trim() !== ''
    const emailRegex = /\S+@\S+\.\S+/
    const validEmail = emailRegex.test(email)
    const validCode = code.trim() !== ''
    const codeLength = code.length >= 6
    const passLength = newPassword.length >= 8
    // ------------------------------------------------------

    const handleCodeChange = (e) => {
        if (e.target.value.length <= 6) {
            setCode(e.target.value)
        }
    }
// --------- Pantalla de Carga ---------
    const showLoading = () => {
        Swal.fire({
            title: 'Cargando',
            text: 'Espere un momento',
            allowOutsideClick: false,
            showConfirmButton: false,
            didOpen: () => {
                Swal.showLoading()
            }
        })
    }
// -------------------------------------

// ------------------------- Envio de correo con código de verificación ------------------------- 
const handleGetCode = async (e) => {
  e.preventDefault()

  if (email === '') {
      Swal.fire({
          icon: 'error',
          title: 'Ingrese su Correo',
          text: 'Debe colocar su correo para continuar'
      })
  } else {
      try {
          showLoading()

          // Crear una nueva instancia de CognitoUser
          const userData = {
              Username: email,
              Pool: UserPool
          }
          const cognitoUser = new CognitoUser(userData)

          // Utilizar el método forgotPassword
          cognitoUser.forgotPassword({
              onSuccess: () => {
                  setSendCode(true)
                  Swal.close()
                  Swal.fire({
                      title: "¡Atención!",
                      text: "Debes ingresar el código de verificación enviado a tu correo.",
                      icon: "info",
                      customClass: {
                          confirmButton: "btn btn-primary"
                      },
                      buttonsStyling: false
                  })
              },
              onFailure: (err) => {
                  console.error(err)
                  Swal.fire({
                      icon: 'error',
                      title: 'Error al cambiar contraseña',
                      text: 'Algo salió mal al actualizar tu contraseña, comunícate con el administrador'
                  })
              }
          })
      } catch (error) {
          console.error(error)
          Swal.fire({
              icon: 'error',
              title: 'Error al cambiar contraseña',
              text: 'Algo salió mal al actualizar tu contraseña, comunícate con el administrador'
          })
      }
  }
}


    const handleKeyCode = (event) => {
        if (event.key === 'Enter') {
          event.preventDefault()
          handleGetCode(event)
        }
      }
// -----------------------------------------------------------------------------------------------

// ------------------------ Reinicio de contraseña si el código es correcto ------------------------ 
const handleClickResetPassword = async (e) => {
    e.preventDefault()

    if (newPassword !== newPasswordV) {
        Swal.fire({
            icon: 'error',
            title: 'Contraseñas no coinciden',
            text: 'Las contraseñas establecidas no coinciden. Intente de nuevo.'
        })
    } else {
        try {
            showLoading()

            // Crear una nueva instancia de CognitoUser
            const userData = {
                Username: email,
                Pool: UserPool // Asegúrate de que UserPool esté definido correctamente
            }
            const cognitoUser = new CognitoUser(userData)

            // Cambiar la contraseña
            cognitoUser.confirmPassword(code, newPassword, {
                onSuccess: () => {
                    Swal.close()
                    Swal.fire({
                        title: "¡Felicidades!",
                        text: "Su contraseña ha sido actualizada.",
                        icon: "success",
                        customClass: {
                            confirmButton: "btn btn-primary"
                        },
                        buttonsStyling: false
                    }).then((result) => {
                        if (result.isConfirmed) {
                            navigate('/login')
                        }
                    })
                },
                onFailure: (err) => {
                    console.error(err)
                    if (err.message === "Invalid verification code provided, please try again.") {
                        Swal.fire({
                            title: "¡Atención!",
                            text: "El código de verificación que ingresaste es incorrecto.",
                            icon: "info",
                            customClass: {
                                confirmButton: "btn btn-primary"
                            },
                            buttonsStyling: false
                        })
                    } else {
                        Swal.fire({
                            icon: 'error',
                            title: 'Error al cambiar contraseña',
                            text: 'Algo salió mal al actualizar tu contraseña, comunícate con el administrador'
                        })
                    }
                }
            })
        } catch (error) {
            console.error(error)
            Swal.fire({
                icon: 'error',
                title: 'Error al cambiar contraseña',
                text: 'Algo salió mal al actualizar tu contraseña, comunícate con el administrador'
            })
        }
    }
}


    const handleKeyReset = (event) => {
        if (event.key === 'Enter') {
          event.preventDefault()
          handleClickResetPassword(event)
        }
      }
// ---------------------------------------------------------------------------------------------------------

// ----- Al presionar enter redirige al cambio de contraseña -----
    const handleKeySendCode = (event) => {
        if (event.key === 'Enter') {
            event.preventDefault()
            setSendCode("")
        }
    }
// ----------------------------------------------------------------

// ---------------------------------------------- Si no existe un codigo de verificación regresa esta página ----------------------------------------------
    if (sendCode === false) {
        return (
            <div className="auth-wrapper auth-cover" style={{ backgroundColor: '#1274c5' }}>
              <Row className="auth-inner m-0">
                <Col className="d-none d-lg-flex align-items-center p-5" lg="8" sm="12">
                  <div className="w-100 d-lg-flex align-items-center justify-content-center px-5">
                    <img className="img-fluid" src={LogoND} alt="Login Cover" />
                  </div>
                </Col>
                <Col className="d-flex align-items-center auth-bg px-2 p-lg-5" lg="4" sm="12">
                    <Col className="px-xl-2 mx-auto" sm="8" md="6" lg="12">
                        <CardTitle tag="h2" className="fw-bold mb-1">
                            Cambiar Contraseña
                        </CardTitle>
                        <hr />
                        <CardText className="mb-2">
                            Ingresa tu correo electrónico
                        </CardText>
                        <Form className="auth-login-form mt-2" onKeyDown={(event) => handleKeyCode(event)}>
                            <div className="mb-4">
                                <div className="d-flex justify-content-between">
                                    <Label className="form-label" for="login-email">
                                        Correo
                                    </Label>
                                </div>
                                <Input
                                    type="email"
                                    id="login-email"
                                    placeholder="ejemplo@ejemplo.com"
                                    onChange={(event) => setEmail(event.target.value)}
                                    autoFocus
                                />
                            </div>
                            <Button onClick={(e) => handleGetCode(e)}  color="primary" block disabled={!validEmail}>
                                Confirmar
                            </Button>
                        </Form>
                    </Col>
                </Col>
              </Row>

            </div>
        )
// ----------------------------------------------------------------------------------------------------------------------------------------------------------

// ---------------------------------- Si el usuario ya brindo sus credenciales, se le pedirá que ingrese su código de verificación ----------------------------------
    } else if (sendCode === true) {
        return (
            <div className="auth-wrapper auth-cover" style={{ backgroundColor: '#1274c5' }}>
              <Row className="auth-inner m-0">
                <Col className="d-none d-lg-flex align-items-center p-5" lg="8" sm="12">
                  <div className="w-100 d-lg-flex align-items-center justify-content-center px-5">
                    <img className="img-fluid" src={LogoND} alt="Login Cover" />
                  </div>
                </Col>
                    
                <Col className="d-flex align-items-center auth-bg px-2 p-lg-5" lg="4" sm="12">
                    <Col className="px-xl-2 mx-auto" sm="8" md="6" lg="12">
                        <CardTitle tag="h2" className="fw-bold mb-1">
                            Cambiar Contraseña
                        </CardTitle>
                        <hr />
                        <CardText className="mb-2">
                            Ingresa el Código de Verificación para validar tu usuario
                        </CardText>
                        <Form className="auth-login-form mt-2" onKeyDown={(e) => handleKeySendCode(e)} >
                            <div className="mb-4">
                                <div className="d-flex justify-content-between">
                                    <Label className="form-label" for="login-number">
                                        Código de Verificación
                                    </Label>
                                </div>
                                <Input
                                    className='text-center'
                                    type="number"
                                    id="login-number"
                                    placeholder="000000"
                                    value={code}
                                    onChange={(event) => handleCodeChange(event)}
                                    autoFocus
                                />
                            </div>
                            <Button onClick={(e) => { e.preventDefault(); setSendCode("") }} color="primary" block disabled={!validCode || !codeLength}>
                                Confirmar
                            </Button>
                        </Form>
                    </Col>
                </Col>
              </Row>

            </div>
        )
// --------------------------------------------------------------------------------------------------------------------------------------------------------------

// ---------------------------------------- Se guarda el código de verificación y se pide que ingrese su nueva contraseña ----------------------------------------
    } else {
        return (
            <div className="auth-wrapper auth-cover" style={{ backgroundColor: '#1274c5' }}>
              <Row className="auth-inner m-0">
              <Col className="d-none d-lg-flex align-items-center p-5" lg="8" sm="12">
                <div className="w-100 d-lg-flex align-items-center justify-content-center px-5">
                  <img className="img-fluid" src={LogoND} alt="Login Cover" />
                </div>
              </Col>
                <Col className="d-flex align-items-center auth-bg px-2 p-lg-5" lg="4" sm="12">
                    <Col className="px-xl-2 mx-auto" sm="8" md="6" lg="12">
                        
                        <CardTitle tag="h2" className="fw-bold mb-1">
                            Cambiar Contraseña
                        </CardTitle>
                        <hr />
                        <CardText className="mb-2">
                            La nueva contraseña debe ser diferente <br />a la establecida por el administrador
                        </CardText>
                        <Form className="auth-login-form mt-2" onKeyDown={(event) => handleKeyReset(event)}>
                            <div className="mb-1">
                                <div className="d-flex justify-content-between">
                                    <Label className="form-label" for="login-password">
                                        Nueva Contraseña
                                    </Label>
                                </div>
                                <InputPasswordToggle
                                    className="input-group-merge"
                                    id="login-password1"
                                    onChange={(event) => setNewPassword(event.target.value)}
                                />
                                {
                                    !passLength && <p className="error" style={{ color: 'red', fontSize: 10, paddingTop: 3 }}>La contraseña debe ser de 8 dígitos o más</p>
                                }
                            </div>
                            <div className="mb-1 pb-3 pt-2">
                                <div className="d-flex justify-content-between">
                                    <Label className="form-label" for="login-password">
                                        Repetir Contraseña
                                    </Label>
                                </div>
                                <InputPasswordToggle
                                    className="input-group-merge"
                                    id="login-password2"
                                    onChange={(event) => setNewPasswordV(event.target.value)}
                                />
                            </div>
                            <div>
                                <Row>
                                    <Col>
                                        <Button color="danger" onClick={() => setSendCode(true)} block>
                                            Volver
                                        </Button>
                                    </Col>
                                    <Col>
                                        <Button color="primary" onClick={(e) => handleClickResetPassword(e)} block disabled={!validCampos || !passLength}>
                                            Confirmar
                                        </Button>
                                    </Col>
                                </Row>
                            </div>
                        </Form>
                    </Col>
                </Col>
              </Row>
            </div>
        )
    }
// --------------------------------------------------------------------------------------------------------------------------------------------------------------

}

export default ForgotPassword