import React, { useState, useEffect  } from 'react'
import { Card, CardHeader, CardBody, CardTitle, Label, Input, Button } from 'reactstrap'
import swal from 'sweetalert'

import UserLogs from "../@core/components/logs_user/UserLogs"

const Reportes = () => {
  const [startDate, setStartDate] = useState('')
  const [endDate, setEndDate] = useState('')

  useEffect(() => {
    const today = new Date()
    const formattedDate = today.toISOString().split('T')[0] // Formatea la fecha a YYYY-MM-DD
    setStartDate(formattedDate)
    setEndDate(formattedDate)
  }, [])

  const excelFacturacionApi = process.env.REACT_APP_EXCEL_FACTURA_API

  const handleDownloadExcel = async () => {
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
        const data = await response.json() // Parse the JSON
        const url = JSON.parse(data.body).url // Extract the URL from the nested JSON

        window.location.href = url
        swal({
          title: "Excel",
          text: "Descargado correctamente.",
          icon: "success",
          button: "OK",
          timer: 3000
        })
        loadData()
      } else {
        swal({
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
                />
              </div>
              <div className="mb-3">
                <Label for="endDate">Fecha de Fin</Label>
                <Input
                  type="date"
                  id="endDate"
                  value={endDate}
                  onChange={e => setEndDate(e.target.value)}
                />
              </div>
              <button 
                  type="button" 
                  className="btn btn-primary"
                  onClick={handleDownloadExcel}
                  
                >
                  Descargar Excel
              </button>
            </CardBody>
          </Card>
        </div>
      </div>
    </>
  )
}

export default Reportes
