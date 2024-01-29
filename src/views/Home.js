import React, { useState } from "react"
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

const Home = () => {
  const [telefono, setTelefono] = useState('')
  const [nombre, setNombre] = useState('')
  const [selectedProduct, setSelectedProduct] = useState('')
  const [codigoGenerado, setCodigoGenerado] = useState('')
  const [error, setError] = useState(false)

  const handleSubmit = async (event) => {
    event.preventDefault()

    if ([nombre, telefono].includes('')) {

      setError(true)
    } else {
      setError(false)

      const data = {
        nombre,
        telefono,
        producto: selectedProduct
      }
  
      try {
        const response = await fetch('https://vbfz5r6da3.execute-api.us-east-1.amazonaws.com/dev/generador', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json'
          },
          body: JSON.stringify(data)
        })
  
        if (response.ok) {
          const responseData = await response.json()
        const responseBody = JSON.parse(responseData.body)
        setCodigoGenerado(responseBody.codigo)
        } else {
          // swal('Error en la solicitud:', response.statusText)
          swal({
            title: 'Error en la solicitud',
            text: response.statusText,
            icon:'warning',
            button:'OK',
            timer: '3000'
          })
        }
      } catch (error) {
        // swal('Error al realizar la solicitud:', error.message)
        swal({
          title: 'Error al realizar la solicitud',
          text: error.message,
          icon:'error',
          button:'OK',
          timer: '3000'
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
                onChange={(event) => setNombre(event.target.value)}
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
                <option value="Suscripción PDF mensual">Suscripción PDF mensual</option>
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
