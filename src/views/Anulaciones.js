import React, { useState} from 'react'
import { Card, CardHeader, CardBody, CardTitle, Label, Input, Button } from 'reactstrap'
import swal from 'sweetalert'

const Anulaciones = () => {
  const [isLoading, setIsLoading] = useState(true)
  const [telefono, setTelefono] = useState('')
  const [noTransaccion, setNoTransaccion] = useState('')
  const [fecha, setFecha] = useState('')
  const [transaccionObtenida, setTransaccionObtenida] = useState({})
  const [error, setError] = useState(false)

  const transaccionAPI = 'https://e7sffoygdj.execute-api.us-east-1.amazonaws.com/dev/anulacion/obtener'

  const formatFecha = (fecha) => {
    const date = new Date(fecha)
    return date.toISOString().split('T')[0]
  }

  const handleSubmit = async (event) => {
    event.preventDefault()
  
    if ([noTransaccion, telefono, fecha].includes('')) {
      setError(true)
    } else {
      setError(false)
  
      const formattedFecha = formatFecha(fecha)
      const data = {
        noTransaccion,
        telefono: `+502${telefono}`,
        fecha: formattedFecha
      }
  
      try {
        const response = await fetch(transaccionAPI, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json'
          },
          body: JSON.stringify(data)
        })
  
        if (response.ok) {
          const responseData = await response.json()
          setIsLoading(false)
  
          // Verifica si responseData.body es una cadena y parsea si es necesario
          const bodyData = typeof responseData.body === 'string' ? JSON.parse(responseData.body) : responseData.body
  
          if (Array.isArray(bodyData.data)) {
            // Filtra los datos para excluir el campo "data"
            const filteredData = bodyData.data.map(item => {
              const { data, ...filteredItem } = item
              console.log(data) // Aquí puedes procesar los datos específicos dentro del campo "data"
              const parsedData = JSON.parse(data)
              console.log('Parsed data:', parsedData)
              return { ...filteredItem, parsedData }
            })
            setTransaccionObtenida(filteredData[0]) // Asume que solo hay un objeto en el array
          } else {
            console.error('bodyData.data is not an array:', bodyData.data)
            swal({
              title: 'Error en la solicitud',
              text: 'La respuesta del servidor no es un array.',
              icon: 'warning',
              button: 'OK',
              timer: '3000'
            })
          }
        } else {
          const errorResponse = await response.json()
          console.error('Server response:', errorResponse)
          swal({
            title: 'Error en la solicitud',
            text: errorResponse.message || response.statusText,
            icon: 'warning',
            button: 'OK',
            timer: '3000'
          })
        }
      } catch (error) {
        swal({
          title: 'Error al realizar la solicitud',
          text: error.message,
          icon: 'error',
          button: 'OK',
          timer: '3000'
        })
      }
    }
  }
  
  
  return (
    <>
      <div style={{ display: 'flex' }}>
        <div style={{ flex: 1 }}>
          <Card>
            <CardHeader style={{ backgroundColor: '#1274c5', color: '#fff' }}>
              <CardTitle>Usuario de servicio al cliente</CardTitle>
            </CardHeader>
            <CardBody>
              <form className="mt-2" onSubmit={handleSubmit}>
                {error && (
                  <p className="alert alert-danger text-center">
                    Todos los campos son obligatorios
                  </p>
                )}
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
                  <Label className="form-label" for="no_transaccion">
                    No. Transaccion
                  </Label>
                  <Input
                    type="text"
                    id="no_transaccion"
                    placeholder="456456545"
                    value={noTransaccion}
                    onChange={(event) => {
                      const input = event.target.value
                      const regex = /^[0-9\b]+$/
                      if (input === '' || regex.test(input)) {
                        setNoTransaccion(input)
                      }
                    }}
                  />
                </div>
                <div className="mb-1">
                  <Label className="form-label" for="fecha">
                    Fecha
                  </Label>
                  <Input
                    type="date"
                    id="fecha"
                    value={fecha}
                    onChange={(event) => setFecha(event.target.value)}
                  />
                </div>
                <Button color="primary" block>
                  Buscar
                </Button>
              </form>
            </CardBody>
          </Card>
        </div>

        <div style={{ flex: 2, marginLeft: '20px' }}>
          {isLoading ? (
            <p>Cargando datos...</p>
          ) : (
            transaccionObtenida && (
              <Card>
                <CardHeader style={{ backgroundColor: '#1274c5', color: '#fff' }}>
                  <CardTitle>Transacción obtenida:</CardTitle>
                </CardHeader>
                <CardBody>
                  <form>
                  <div className="row mb-1">
                      <div className="col">
                      <Label className="form-label" for="retrievalrefno">
                      No. Transaccion
                        </Label>
                        <Input type="text" id="retrievalrefno" value={transaccionObtenida.retrievalrefno} readOnly />
                      </div>
                      <div className="col">
                      <Label className="form-label" for="systems_trace_no">
                        No. Auditoria
                      </Label>
                      <Input type="text" id="systems_trace_no" value={transaccionObtenida.systems_trace_no} readOnly />
                      </div>
                    </div>

                    <div className="row mb-1">
                      <div className="col">
                      <Label className="form-label" for="name">
                        Nombre
                      </Label>
                      <Input type="text" id="name" value={transaccionObtenida.name} readOnly />
                      </div>
                      <div className="col">
                      <Label className="form-label" for="email">
                        Email
                      </Label>
                      <Input type="text" id="email" value={transaccionObtenida.email} readOnly />
                      </div>
                    </div>

                    <div className="row mb-1">
                      <div className="col">
                        <Label className="form-label" for="fecha">
                          Fecha
                        </Label>
                        <Input type="text" id="fecha" value={transaccionObtenida.fecha} readOnly />
                      </div>
                      <div className="col">
                      <Label className="form-label" for="phone_number">
                        Número de teléfono
                      </Label>
                      <Input type="text" id="phone_number" value={transaccionObtenida.phone_number} readOnly />
                      </div>
                    </div>

                    <div className="row mb-1">
                      <div className="col">
                      <Label className="form-label" for="product">
                        Producto
                      </Label>
                      <Input type="text" id="product" value={transaccionObtenida.product} readOnly />
                      </div>
                      <div className="col">
                      <Label className="form-label" for="price">
                        Precio
                      </Label>
                      <Input type="text" id="price" value={transaccionObtenida.price} readOnly />
                      </div>
                    </div>

                    <div className="row mb-1">
                      <div className="col">
                      <Label className="form-label" for="nit">
                        NIT
                      </Label>
                      <Input type="text" id="nit" value={transaccionObtenida.nit} readOnly />
                      </div>
                      <div className="col">
                      <Label className="form-label" for="codigo">
                        Código
                      </Label>
                      <Input type="text" id="codigo" value={transaccionObtenida.codigo} readOnly />
                      </div>
                    </div>
                  </form>
                </CardBody>
              </Card>

            )
          )}
        </div>
      </div>

    </>
  )
}

export default Anulaciones
