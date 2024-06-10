import React, { useState, useEffect} from 'react'
import { Card, CardHeader, CardBody, CardTitle, Label, Input, Button } from 'reactstrap'
import Swal from 'sweetalert2'

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
  const [errorAnulacion, setErrorAnulacion] = useState(false)

  const userEmail = localStorage.getItem('userEmail')
  const userIP = localStorage.getItem('userIP')

  const transaccionAPI = process.env.REACT_APP_OBTENER_TRANSACCION_API
  const neoNetAnulacionAPI = process.env.REACT_APP_NEONET_ANULACION_API
  const anulacionAPI = process.env.REACT_APP_ANULACION_API
  const vaucherAPI = process.env.REACT_APP_VOUCHER_API


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
  }
  
  const handleSubmit = async (event) => {
    event.preventDefault()

    if ([noTransaccion, telefono, fecha].includes('')) {
      setError(true)
      setTimeout(() => {
        setError(false)
      }, 3000)
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

          if (bodyData && typeof bodyData === 'object') {
            if (bodyData.message) {

              Swal.fire({
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

            Swal.fire({
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
          Swal.fire({
            title: 'Error en la solicitud',
            text: errorResponse.message || response.statusText,
            icon: 'warning',
            button: 'OK',
            timer: 3000
          })
          
        }
      } catch (error) {
        Swal.fire({
          title: 'Error al realizar la solicitud',
          text: error.message,
          icon: 'error',
          button: 'OK',
          timer: 4000
        })
        
      }
      setIsLoading(false)
    }
  }  
  
  const handleSubmitAnulation = async (event) => {
    event.preventDefault()
  
    if ([descripcion].includes('')) {
      setErrorAnulacion(true)
      setTimeout(() => {
        setErrorAnulacion(false)
      }, 4000)
      return
    }
  
    setErrorAnulacion(false)
  
    Swal.fire({
      title: "Confirmar Anulación",
      text: "¿Estás seguro de que deseas anular esta transacción?",
      icon: "warning",
      showCancelButton: true,
      confirmButtonText: "Sí",
      cancelButtonText: "cancelar",
      dangerMode: true
    }).then(async (result) => {
      if (result.isConfirmed) {
        const payload = {
          TraceNo: transaccionObtenida.systems_trace_no,
          MessageTypeId: "0200",
          ProcCode: "020000",
          Type: "",
          PrimaryNum: "",
          DateExp: "",
          CVV: "",
          Amount: ""
        }
  
        // Mostrar el Sweet Alert de carga
        Swal.fire({
          title: 'Anulando transacción...',
          text: 'Por favor espera...',
          icon: 'info',
          allowOutsideClick: false,
          didOpen: () => {
            Swal.showLoading()
          }
        })
  
        try {
          const response = await fetch(neoNetAnulacionAPI, {
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
          const bodyData = JSON.parse(responseData.body)
          const ResponseCode = bodyData.ResponseCode
  
          if (ResponseCode === "00" || ResponseCode === "10" || ResponseCode === "35") {
            const dataAnulacion = {
              id: transaccionObtenida.id,
              cognito_id: transaccionObtenida.cognito_id,
              status: "Anulado",
              ingreso: "0200",
              proceso: "020000",
              retrievalrefno: transaccionObtenida.retrievalrefno,
              responsecode: transaccionObtenida.responsecode,
              data: responseData,
              motivo,
              descripcion
            }
  
            const dataVaucher = {
              authIdResponse: transaccionObtenida.authidresponse,
              numeroTarjeta: transaccionObtenida.card,
              vc: transaccionObtenida.vc,
              monto: transaccionObtenida.price,
              nombreTarjetahabiente: transaccionObtenida.nombreTarjetahabiente,
              systemsTraceNo: transaccionObtenida.systems_trace_no,
              retrievalRefNo: transaccionObtenida.retrievalrefno,
              tipoVaucher: 'Anulación',
              emails: transaccionObtenida.email
            }
  
            try {
              const responseDynamo = await fetch(anulacionAPI, {
                method: 'POST',
                headers: {
                  'Content-Type': 'application/json'
                },
                body: JSON.stringify(dataAnulacion)
              })
  
              if (!responseDynamo.ok) {
                throw new Error(`HTTP error! status: ${responseDynamo.status}`)
              }
  
              const responseVaucher = await fetch(vaucherAPI, {
                method: 'POST',
                headers: {
                  'Content-Type': 'application/json'
                },
                body: JSON.stringify(dataVaucher)
              })
  
              if (!responseVaucher.ok) {
                throw new Error(`HTTP error! status: ${responseVaucher.status}`)
              }
  
              Swal.fire({
                title: "Anulado",
                text: "Anulación realizada correctamente.",
                icon: "success",
                timer: 3000
              })
  
              await UserLogs('Anulacion', transaccionObtenida.codigo, 'Anulacion', userIP, userEmail)
  
              resetFormulario()
              setIsLoading(false)
            } catch (error) {
              console.error('Error:', error)
              Swal.fire({
                title: "Error",
                text: "Error en la solicitud",
                icon: "error",
                timer: 3000
              })
            }
          } else {
            Swal.fire({
              title: "Error",
              text: "Error en la solicitud",
              icon: "warning",
              timer: 3000
            })
          }
        } catch (error) {
          console.error('Error:', error)
          Swal.fire({
            title: "Error",
            text: "Error en la solicitud",
            icon: "error",
            timer: 3000
          })
        }
  
        setIsLoading(false)
      }
    })
  }
  
  
  return (
    <>
      <div style={{ display: 'flex' }} className="flex-container">
        <div style={{ flex: 1 }}>
          <Card>
            <CardHeader style={{ backgroundColor: '#1274c5', color: '#fff' }}>
              <CardTitle>Usuario de servicio al cliente</CardTitle>
            </CardHeader>
            <CardBody>
            {error && (
                  <p className="alert alert-danger text-center mt-2">
                    Todos los campos son obligatorios
                  </p>
                )}
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
                {errorAnulacion && (
                  <p className="alert alert-danger text-center mt-2">
                    Todos los campos son obligatorios
                  </p>
                )}
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
                          disabled={isAnularDisabled()}
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
                          onChange={(e) => setDescripcion(e.target.value)}
                          disabled={isAnularDisabled()} />
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
                    <Button color="primary" block disabled={isAnularDisabled()}>
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
