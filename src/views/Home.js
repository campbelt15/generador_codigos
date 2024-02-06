import React, { useEffect, useState } from "react"
import swal from "sweetalert"
import {
  Card,
  CardHeader,
  CardBody,
  CardTitle,
  Label,
  Input,
  Button
} from "reactstrap"
import { useNavigate } from 'react-router-dom'

const Home = () => {
  const [telefono, setTelefono] = useState('')
  const [nombre, setNombre] = useState('')
  const [selectedProduct, setSelectedProduct] = useState('')
  const [codigoGenerado, setCodigoGenerado] = useState('')
  const [productOptions, setProductOptions] = useState([])
  const [error, setError] = useState(false)
  const navigate = useNavigate()

  const generadorApi = process.env.REACT_APP_GENERADOR_API
  const smsApi = process.env.REACT_APP_SMS_API
  const planApi = process.env.REACT_APP_PLAN_API

  useEffect(() => {
    const sessionToken = localStorage.getItem('sessionToken') 
    if (!sessionToken) {
      navigate('/login') 
    }
  
    // Realizar una solicitud a la API para obtener las opciones de los planes
    fetch(planApi)
      .then((response) => response.json())
      .then((data) => {
        try {
          const parsedData = JSON.parse(data.body)
          if (Array.isArray(parsedData)) {
            setProductOptions(parsedData)
          } else {
            console.error("La respuesta de la API no es un arreglo válido:", parsedData)
          }
        } catch (error) {
          console.error("Error al parsear la respuesta JSON:", error)
        }
      })
      .catch((error) => {
        console.error("Error al obtener las opciones:", error)
      })
  }, [navigate])

  const handleSubmit = async (event) => {
    event.preventDefault()
  
    if ([nombre, telefono].includes("")) {
      setError(true)
    } else {
      setError(false)
  
      const data = {
        nombre,
        telefono,
        producto: selectedProduct
      }
  
      try {
        const response = await fetch(
          generadorApi,
          {
            method: "POST",
            headers: {
              "Content-Type": "application/json"
            },
            body: JSON.stringify(data)
          }
        )
  
        if (response.ok) {
          const responseData = await response.json()
          const responseBody = JSON.parse(responseData.body)
          setCodigoGenerado(responseBody.codigo)
        
          const smsData = {
            message: `Código de suscripción: ${responseBody.codigo}`,
            phone_number: `+502${telefono}`
          }
          
          const smsResponse = await fetch(
            smsApi,
            {
              method: "POST",
              headers: {
                "Content-Type": "application/json"
              },
              body: JSON.stringify(smsData)
            }
          )
  
          if (smsResponse.ok) {
            console.log(response)
            swal({
              title: "SMS",
              text: "Código enviado correctamente.",
              icon: "success",
              button: "OK",
              timer: "3000"
            })
          } else {
            swal({
              title: "Error al enviar el mensaje",
              text: smsResponse.statusText,
              icon: "warning",
              button: "OK",
              timer: "3000"
            })

          }
        } else {

          swal({
            title: "Error en la solicitud",
            text: response.statusText,
            icon: "warning",
            button: "OK",
            timer: "3000"
          })
        }
      } catch (error) {

        swal({
          title: "Error al realizar la solicitud",
          text: error.message,
          icon: "error",
          button: "OK",
          timer: "3000"
        })
      }
    }
  }
  
  
  return (
    <div>
      <Card>
        <CardHeader style={{ backgroundColor: '#1274c5', color: '#fff' }}>
          <CardTitle>Usuario de servicio al cliente</CardTitle>
        </CardHeader>
        <CardBody>
          <form className=" mt-2" onSubmit={handleSubmit}>
          {error && 
          <p className="alert alert-danger text-center">Todos los campos son obligatorios</p>}
            <div className="mb-1">
              
              <Label className="form-label" for="tel_number">
                Número de teléfono
              </Label>
              <Input
                type="text"
                id="tel_number"
                placeholder="5467 3456"
                autoFocus
                value={telefono}
                onChange={(event) => {
                  const input = event.target.value
                  const regex = /^[0-9\b]+$/
                  if (input === '' || regex.test(input)) {
                    if (input.length <= 8) {
                      setTelefono(input)
                    }
                  }
                }}
              />

            </div>
            <div className="mb-1">
              <Label className="form-label" for="customer_name">
                Nombre del cliente
              </Label>
              <Input
                type="text"
                id="customer_name"
                placeholder="Juan Peréz"
                value={nombre}
                onChange={(event) => {
                  const input = event.target.value
                  const regex = /^[a-zA-Z\s\b]+$/
                  if (input === '' || regex.test(input)) {
                      setNombre(input)
                  }
                }
              }
              />
            </div>

            <div className="mb-1">
              <Label className="form-label" for="product">
                Producto
              </Label>
              <Input
                type="select"
                id="product"
                value={selectedProduct}
                onChange={(event) => setSelectedProduct(event.target.value)}
              >
                {/* <option value="">Selecciona un producto</option> */}
                {productOptions.map((option) => (
                  <option key={option.id} value={option.tipo_plan}>
                    {option.tipo_plan}
                  </option>
                ))}
              </Input>
            </div>
            
            <Button color="primary" block>
              Generar Código de suscripción
            </Button>
          </form>
        </CardBody>
      </Card>

      {codigoGenerado && (
        <Card>
          <CardHeader style={{ backgroundColor: '#1274c5', color: '#fff' }}>
            <CardTitle>Código generado</CardTitle>
          </CardHeader>
          <CardBody >
            <h1 style={{ textAlign: 'center', fontSize: '3rem', lineHeight: '1.5' }}>{codigoGenerado}</h1>
          </CardBody>
        </Card>
      )}

    </div>
  )
}

export default Home
