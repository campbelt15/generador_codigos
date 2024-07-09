import React, { useEffect, useState } from "react"
import swal from "sweetalert"
import { Card, CardHeader, CardBody, CardTitle, Label, Input, Button } from "reactstrap"
import { useNavigate } from "react-router-dom"

const swalSuccess = (title, text) => {
  swal({
    title,
    text,
    icon: "success",
    button: "OK",
    timer: 3000
  })
}

const swalError = (title, text) => {
  swal({
    title,
    text,
    icon: "error",
    button: "OK",
    timer: 3000
  })
}

const Home = () => {
  const [phone, setPhone] = useState("")
  const [name, setName] = useState("")
  const [selectedProduct, setSelectedProduct] = useState("")
  const [generatedCode, setGeneratedCode] = useState("")
  const [productOptions, setProductOptions] = useState([])
  const [error, setError] = useState(false)
  const navigate = useNavigate()

  const GENERATOR_API = process.env.REACT_APP_GENERADOR_API
  const SMS_API = process.env.REACT_APP_SMS_API
  const PLAN_API = process.env.REACT_APP_PLAN_API

  const userEmail = localStorage.getItem("userEmail")
  const userIP = localStorage.getItem("userIP")

  const checkSessionToken = () => {
    const sessionToken = localStorage.getItem("sessionToken")
    if (!sessionToken) {
      navigate("/login")
    }
  }

  const fetchProductOptions = async () => {
    try {
      const response = await fetch(PLAN_API)
      const data = await response.json()
      const parsedData = JSON.parse(data.body)
      if (Array.isArray(parsedData)) {
        setProductOptions(parsedData)
      } else {
        console.error("La respuesta de la API no es un arreglo válido:", parsedData)
      }
    } catch (error) {
      console.error("Error al obtener las opciones:", error)
    }
  }

  useEffect(() => {
    checkSessionToken()
    fetchProductOptions()
  }, [navigate])

  const sendSMS = async (code) => {
    const smsData = {
      message: `Código de suscripción: ${code}`,
      phone_number: `+502${phone}`
    }

    try {
      const response = await fetch(SMS_API, {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify(smsData)
      })

      if (!response.ok) {
        throw new Error(`Error al enviar el SMS: ${response.statusText}`)
      }

      swalSuccess("SMS", "Código enviado correctamente.")
    } catch (error) {
      swalError("Error al enviar el mensaje", error.message)
    }
  }

  const handleSubmit = async (event) => {
    event.preventDefault()

    if ([name, phone, selectedProduct].includes("")) {
      setError(true)
      return
    }

    setError(false)
    const data = {
      nombre: name,
      telefono: `+502${phone}`,  
      producto: selectedProduct,
      ip: userIP,
      responsable: userEmail
    }

    // console.log("Enviando datos:", data) 

    try {
      const response = await fetch(GENERATOR_API, {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify(data)
      })

      // console.log("Respuesta del servidor:", response) 

      if (!response.ok) {
        throw new Error(`Error en la solicitud: ${response.statusText}`)
      }

      const responseData = await response.json()
      // console.log("Datos de la respuesta:", responseData) 

      if (!responseData.body) {
        throw new Error("Respuesta del servidor vacía")
      }

      const responseBody = JSON.parse(responseData.body)
      setGeneratedCode(responseBody.codigo)
      await sendSMS(responseBody.codigo)
      swalSuccess("Código enviado correctamente.")
    } catch (error) {
      swalError("Error al realizar la solicitud", error.message)
    }
  }

  const handleInputChange = (setter, validator) => (event) => {
    const value = event.target.value
    if (validator(value)) {
      setter(value)
    }
  }

  return (
    <div>
      <Card>
        <CardHeader style={{ backgroundColor: "#1274c5", color: "#fff" }}>
          <CardTitle>Usuario de servicio al cliente</CardTitle>
        </CardHeader>
        <CardBody>
          <form className="mt-2" onSubmit={handleSubmit}>
            {error && <p className="alert alert-danger text-center">Todos los campos son obligatorios</p>}
            <div className="mb-1">
              <Label className="form-label" htmlFor="tel_number">
                Número de teléfono
              </Label>
              <Input
                type="text"
                id="tel_number"
                placeholder="5467 3456"
                autoFocus
                value={phone}
                onChange={handleInputChange(setPhone, (value) => /^[0-9\b]{0,8}$/.test(value))}
              />
            </div>
            <div className="mb-1">
              <Label className="form-label" htmlFor="customer_name">
                Nombre del cliente
              </Label>
              <Input
                type="text"
                id="customer_name"
                placeholder="Juan Peréz"
                value={name}
                onChange={handleInputChange(setName, (value) => /^[a-zA-Z\s\b]*$/.test(value))}
              />
            </div>
            <div className="mb-1">
              <Label className="form-label" htmlFor="product">
                Producto
              </Label>
              <Input
                type="select"
                id="product"
                value={selectedProduct}
                onChange={(event) => setSelectedProduct(event.target.value)}
              >
                <option value="">Selecciona un producto</option>
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

      {generatedCode && (
        <Card>
          <CardHeader style={{ backgroundColor: "#1274c5", color: "#fff" }}>
            <CardTitle>Código generado</CardTitle>
          </CardHeader>
          <CardBody>
            <h1 style={{ textAlign: "center", fontSize: "3rem", lineHeight: "1.5" }}>{generatedCode}</h1>
          </CardBody>
        </Card>
      )}
    </div>
  )
}

export default Home
