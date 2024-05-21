import React, { useState, useEffect} from 'react'
import { Card, CardHeader, CardBody, CardTitle, Label, Input, Button } from 'reactstrap'
import swal from 'sweetalert'

import UserLogs from "../@core/components/logs_user/UserLogs"

const Anulaciones = () => {
  const [isLoading, setIsLoading] = useState(false)
  const [telefono, setTelefono] = useState('')
  const [noTransaccion, setNoTransaccion] = useState('')
  const [fecha, setFecha] = useState('')
  const [motivo, setMotivo] = useState('duplicidad')
  const [descripcion, setDescripcion] = useState('')
  const [transaccionObtenida, setTransaccionObtenida] = useState({})
  const [error, setError] = useState(false)

  const userEmail = localStorage.getItem('userEmail')
  const userIP = localStorage.getItem('userIP')

  const transaccionAPI = 'https://e7sffoygdj.execute-api.us-east-1.amazonaws.com/dev/anulacion/obtener'

  useEffect(() => {
    if (transaccionObtenida.motivo !== undefined) {
      setMotivo(transaccionObtenida.motivo || 'duplicidad')
    }
    if (transaccionObtenida.descripcion !== undefined) {
      setDescripcion(transaccionObtenida.descripcion || '')
    }
  }, [transaccionObtenida])
  

  const formatFecha = (fecha) => {
    const date = new Date(fecha)
    return date.toISOString().split('T')[0]
  }

  const restarDosDias = (fecha) => {
    const date = new Date(fecha)
    date.setDate(date.getDate() - 2) // Resta dos días
    return date.toISOString().split('T')[0]
  }  

  const isAnularDisabled = () => {
    const status = transaccionObtenida.status
    const fechaTransaccion = new Date(transaccionObtenida.fecha)
    const fechaLimite = new Date(restarDosDias(new Date()))
    return status === 'Anulado' || fechaTransaccion < fechaLimite
  }

  const resetFormulario = () => {
    setTelefono('')
    setNoTransaccion('')
    setFecha('')
    setMotivo('duplicidad')
    setDescripcion('')
    setTransaccionObtenida({})
    console.log('Formulario reseteado:', {
      telefono: '',
      noTransaccion: '',
      fecha: '',
      motivo: 'duplicidad',
      descripcion: '',
      transaccionObtenida: {}
    })
  }
  
  const handleSubmit = async (event) => {
    event.preventDefault()

    if ([noTransaccion, telefono, fecha].includes('')) {
      setError(true)
    } else {
      setError(false)
      setIsLoading(true)

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

          // Verifica si responseData.body es una cadena y parsea si es necesario
          const bodyData = responseData.body ? (typeof responseData.body === 'string' ? JSON.parse(responseData.body) : responseData.body) : {}

          console.log("bodyData: ")
          console.log(bodyData)

          if (bodyData && typeof bodyData === 'object') {
            console.log('dentro del if')

            if (bodyData.message) {
              console.log(bodyData.message)
              swal({
                title: 'Error en la solicitud',
                text: 'No se encontró la transacción.',
                icon: 'warning',
                button: 'OK',
                timer: 3000
              })
              setTransaccionObtenida({})
              setDescripcion('')
              setMotivo('duplicidad')
              setIsLoading(false)
            } else {
              // Si bodyData es un objeto, asignarlo directamente
              const { data, ...filteredItem } = bodyData
              const parsedData = data && data.body ? JSON.parse(data.body) : {}
              setTransaccionObtenida({ ...filteredItem, parsedData })
              
            }
          } else {
            console.error('bodyData is not a valid object:', bodyData)

            swal({
              title: 'Error en la solicitud',
              text: 'No se encontró la transacción.',
              icon: 'warning',
              button: 'OK',
              timer: 3000
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
            timer: 3000
          })
          
        }
      } catch (error) {
        swal({
          title: 'Error al realizar la solicitud',
          text: error.message,
          icon: 'error',
          button: 'OK',
          timer: 3000
        })
        
      }
      setIsLoading(false)
    }
  }  
  
  const handleSubmitAnulation = async (event) => {
    event.preventDefault()

    if ([descripcion].includes('')) {
      setError(true)
    } else {
      setError(false)

      const payload = {
        TraceNo: transaccionObtenida.systems_trace_no,
        MessageTypeId:"0200", 
        ProcCode:"020000", 
        Type:"", 
        PrimaryNum:"", 
        DateExp:"", 
        CVV:"", 
        Amount:""
      }
  
      try {
        const response = await fetch('https://vbfz5r6da3.execute-api.us-east-1.amazonaws.com/dev/payment-neonet', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json'
          },
          body: JSON.stringify(payload)
        })
      
        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`)
        }
      
        const responseData = await response.json()

        // Parsear la cadena JSON en el campo 'body'
        const bodyData = JSON.parse(responseData.body)

        // Acceder a elementos específicos
        const ResponseCode = bodyData.ResponseCode

        console.log('ResponseCode:', ResponseCode)

        if (ResponseCode === "00" || ResponseCode === "10") {
          console.log("Dentro del if ResponseCode")
          const dataAnulacion = {
            id: transaccionObtenida.id,
            cognito_id:transaccionObtenida.cognito_id, 
            status:"Anulado", 
            ingreso:"0200", 
            proceso:"020000", 
            retrievalrefno:transaccionObtenida.retrievalrefno, 
            responsecode:transaccionObtenida.responsecode, 
            data:responseData,
            motivo,
            descripcion
          }
    
          try {
              const responseDynamo = await fetch('https://e7sffoygdj.execute-api.us-east-1.amazonaws.com/dev/anulacion', {
                method: 'POST',
                headers: {
                  'Content-Type': 'application/json'
                },
                body: JSON.stringify(dataAnulacion)
              })
            
              if (!responseDynamo.ok) {
                throw new Error(`HTTP error! status: ${responseDynamo.status}`)
              } 

              console.log('se ingreso la anulacion en Dynamo')
              console.log('Aca debe ir el swal notificando que la transaccion de anulacion es exitosa')

              swal({
                title: "Anulado",
                text: "Anulación realizada correctamente.",
                icon: "success",
                button: "OK",
                timer: "3000"
              })

              await UserLogs('Anulacion', transaccionObtenida.codigo, 'Anulacion', userIP, userEmail)
              console.log('resetFormulario Inicio')
              resetFormulario()
              console.log('resetFormulario Fin')
              setIsLoading(false)
            } catch (error) {
              console.error('Error:', error)
              swal({
                title: "Error",
                text: "Error en la solicitud",
                icon: error,
                button: "OK",
                timer: "3000"
              })
            }
        } else {
          console.log("Error la respuesta es diferente a 00 o 10")
          console.log('Aca debe ir el swal notificando que la transaccion de no fue exitosa')

          swal({
            title: "Error",
            text: "Error en la solicitud",
            icon: "warning",
            button: "OK",
            timer: "3000"
          })
        } 
      } catch (error) {
        console.error('Error:', error)
        swal({
          title: "Error",
          text: "Error en la solicitud",
          icon: error,
          button: "OK",
          timer: "3000"
        })
      }
    }
    setIsLoading(false)
  }
  
  return (
    <>
    {error && (
                  <p className="alert alert-danger text-center">
                    Todos los campos son obligatorios
                  </p>
                )}
      <div style={{ display: 'flex' }}>
      
        <div style={{ flex: 1 }}>
        
          <Card>
            <CardHeader style={{ backgroundColor: '#1274c5', color: '#fff' }}>
              <CardTitle>Usuario de servicio al cliente</CardTitle>
            </CardHeader>
            <CardBody>
              <form className="mt-2" onSubmit={handleSubmit}>
                
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
                  <form className="mt-2" onSubmit={handleSubmitAnulation}>
                  <div className="row mb-1">
                      <div className="col">
                      <Label className="form-label" for="status">
                        Estatus
                      </Label>
                      <Input type="text" id="status" value={transaccionObtenida.status || ''} readOnly />
                      </div>
               
                      <div className="col">
                        <Label className="form-label" for="motivo">
                          Motivo de anulación
                        </Label>
                        <Input 
                          type="select" 
                          id="motivo" 
                          value={motivo} 
                          onChange={(e) => setMotivo(e.target.value)}
                        >
                          <option value="duplicidad">Duplicidad de compra</option>
                          <option value="insatisfaccion">Insatisfacción con el servicio</option>
                        </Input>
                      </div>
                  </div>

                  <div className="row mb-1">
                      <div className="col">
                      <Label className="form-label" for="descripcion">
                        Descripción
                      </Label>
                      <Input type="text" id="descripcion" value={descripcion} 
                          onChange={(e) => setDescripcion(e.target.value)} />
                      </div>

                  </div>

                  <div className="row mb-1">
                      <div className="col">
                      <Label className="form-label" for="retrievalrefno">
                      No. Transaccion
                        </Label>
                        <Input type="text" id="retrievalrefno" value={transaccionObtenida.retrievalrefno || ''} readOnly />
                      </div>
                      <div className="col">
                      <Label className="form-label" for="systems_trace_no">
                        No. Auditoria
                      </Label>
                      <Input type="text" id="systems_trace_no" value={transaccionObtenida.systems_trace_no || ''} readOnly />
                      </div>
                    </div>

                    <div className="row mb-1">
                      <div className="col">
                      <Label className="form-label" for="name">
                        Nombre
                      </Label>
                      <Input type="text" id="name" value={transaccionObtenida.name || ''} readOnly />
                      </div>
                      <div className="col">
                      <Label className="form-label" for="email">
                        Email
                      </Label>
                      <Input type="text" id="email" value={transaccionObtenida.email || ''} readOnly />
                      </div>
                    </div>

                    <div className="row mb-1">
                      <div className="col">
                        <Label className="form-label" for="fecha">
                          Fecha
                        </Label>
                        <Input type="text" id="fecha" value={transaccionObtenida.fecha || ''} readOnly />
                      </div>
                      <div className="col">
                      <Label className="form-label" for="phone_number">
                        Número de teléfono
                      </Label>
                      <Input type="text" id="phone_number" value={transaccionObtenida.phone_number || ''} readOnly />
                      </div>
                    </div>

                    <div className="row mb-1">
                      <div className="col">
                      <Label className="form-label" for="product">
                        Producto
                      </Label>
                      <Input type="text" id="product" value={transaccionObtenida.product || ''} readOnly />
                      </div>
                      <div className="col">
                      <Label className="form-label" for="price">
                        Precio
                      </Label>
                      <Input type="text" id="price" value={transaccionObtenida.price || ''} readOnly />
                      </div>
                    </div>

                    <div className="row mb-1">
                      <div className="col">
                      <Label className="form-label" for="nit">
                        NIT
                      </Label>
                      <Input type="text" id="nit" value={transaccionObtenida.nit || ''} readOnly />
                      </div>
                      <div className="col">
                      <Label className="form-label" for="codigo">
                        Código
                      </Label>
                      <Input type="text" id="codigo" value={transaccionObtenida.codigo || ''} readOnly />
                      </div>
                    </div>

                    
                    <Button color="warning" block disabled={isAnularDisabled()}>
                      Anular
                    </Button>

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
