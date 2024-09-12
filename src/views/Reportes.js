import React, { useState, useEffect } from 'react'
import { Card, CardHeader, CardBody, CardTitle, Label, Input, Button } from 'reactstrap'
import swal from 'sweetalert2'

import UserLogs from "../@core/components/logs_user/UserLogs"

const Reportes = () => {
  const [startDate, setStartDate] = useState('')
  const [endDate, setEndDate] = useState('')
  const userEmail = sessionStorage.getItem('userEmail')
  const userIP = sessionStorage.getItem('userIP')

  useEffect(() => {
    const today = new Date()
    const formattedDate = today.toISOString().split('T')[0] // Formatea la fecha a YYYY-MM-DD
    setStartDate(formattedDate)
    setEndDate(formattedDate)
  }, [])

  useEffect(() => {
    const today = new Date()
    const formattedToday = today.toISOString().split('T')[0]
    if (startDate > formattedToday) {
      setStartDate(formattedToday)
    }
  }, [startDate])

  useEffect(() => {
    if (endDate < startDate) {
      setEndDate(startDate)
    }
  }, [endDate, startDate])

  const excelFacturacionApi = process.env.REACT_APP_EXCEL_FACTURA_API

  const handleDownloadExcel = async () => {
    // Mostrar el Sweet Alert de carga
    swal.fire({
      title: 'Descargando',
      text: 'Por favor espera...',
      icon: 'info',
      allowOutsideClick: false,
      didOpen: () => {
        swal.showLoading()
      }
    })

    try {
      const response = await fetch(
        `${excelFacturacionApi}?startDate=${startDate}&endDate=${endDate}`,
        {
          headers: {
            "Content-Type": "application/json"
          }
        }
      )
      

      if (response.ok) {
        const data = await response.json()
        const body = JSON.parse(data.body)

        if (body.message) {
          // Si el mensaje existe, mostrar una advertencia
          swal.fire({
            title: "No se encontraron datos",
            text: body.message,
            icon: "warning",
            button: "OK",
            timer: 3000
          })
        } else if (body.url) {
          const url = body.url // Extraer la URL del JSON anidado
          await UserLogs('Descarga de Excel', '', `Fecha Inicial ${startDate} - Fecha Final ${endDate}`, userIP, userEmail)

          // Descargar el archivo Excel usando un enlace temporal
          const link = document.createElement('a')
          link.href = url
          link.setAttribute('download', `reporte_facturacion-${new Date().toISOString()}.xlsx`)
          document.body.appendChild(link)
          link.click()
          document.body.removeChild(link)
          // Cerrar el Sweet Alert de carga
          swal.close()

          //Modal de descargado
          swal.fire({
            title: "Excel",
            text: "Descargado correctamente.",
            icon: "success",
            button: "OK",
            timer: 3000
          })
        } else {
          // Cerrar el Sweet Alert de carga
          swal.close()

          //modal de error
          swal.fire({
            title: "Error",
            text: "No se pudo obtener la URL de descarga.",
            icon: "error",
            button: "OK",
            timer: 3000
          })
        }
      } else {
        swal.fire({
          title: "Error al descargar",
          text: response.statusText,
          icon: "warning",
          button: "OK",
          timer: 3000
        })
      }
    } catch (error) {
      // Manejar errores aquí
      console.error("Error al descargar", error)
      swal.fire({
        title: "Error",
        text: "Ocurrió un error al intentar descargar el archivo.",
        icon: "error",
        button: "OK",
        timer: 3000
      })
    }
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
              <div className="my-2">
                <Label for="startDate">Fecha de Inicio</Label>
                <Input
                  type="date"
                  id="startDate"
                  value={startDate}
                  onChange={e => setStartDate(e.target.value)}
                  max={new Date().toISOString().split('T')[0]}
                />
              </div>
              <div className="mb-3">
                <Label for="endDate">Fecha de Fin</Label>
                <Input
                  type="date"
                  id="endDate"
                  value={endDate}
                  onChange={e => setEndDate(e.target.value)}
                  min={startDate}
                />
              </div>
              <Button 
                color="primary"
                onClick={handleDownloadExcel}
              >
                Descargar Excel
              </Button>
            </CardBody>
          </Card>
        </div>
      </div>
    </>
  )
}

export default Reportes
