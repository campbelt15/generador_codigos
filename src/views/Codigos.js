import { useEffect, useState } from "react"
import swal from "sweetalert"
import '../assets/css/codigos_datatable.css'
import "primereact/resources/themes/lara-light-cyan/theme.css"
import { DataTable } from 'primereact/datatable'
import { Column } from 'primereact/column'
import { InputText } from 'primereact/inputtext'

const Codigos = () => {
  const REACTIVATEAPI = process.env.REACT_APP_REACTIVATE_API
  const CODESLISTAPI = process.env.REACT_APP_LISTAR_CODIGOS_API

  const [isLoading, setIsLoading] = useState(true)
  const [codesData, setCodesData] = useState([])
  const [globalFilter, setGlobalFilter] = useState(null)
  const userEmail = sessionStorage.getItem('userEmail')
  const userIP = sessionStorage.getItem('userIP')

  const fetchCodesData = async () => {
    try {
      const response = await fetch(CODESLISTAPI)
      const data = await response.json()
      const responseBody = JSON.parse(data.body)
      setCodesData(responseBody.Items)
    } catch (error) {
      console.error('Error al cargar los datos:', error)
    } finally {
      setIsLoading(false)
    }
  }

  useEffect(() => {
    fetchCodesData()
  }, [])

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

  const handleCodeActivation = async (itemData) => {
    const data = {
      ...itemData,
      correo: userEmail,
      ip: userIP
    }

    try {
      const response = await fetch(REACTIVATEAPI, {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify(data)
      })

      if (response.ok) {
        swalSuccess("Reactivado", "Reactivado correctamente.")
        fetchCodesData()
      } else {
        swalError("Error al reactivar", response.statusText)
      }
    } catch (error) {
      swalError("Error al reactivar", error.message)
      console.error("Error al actualizar los datos", error)
    }
  }

  const renderHeader = () => (
    <div className="fs-2 mb-3">
      Lista de Códigos
      <span className="p-input-icon-left ms-2">
        <i className="pi pi-search" />
        <InputText 
          type="search" 
          onInput={(e) => setGlobalFilter(e.target.value)} 
          placeholder="Buscar..." 
        />
      </span>
    </div>
  )

  const renderFooter = () => (
    <div className="table-footer">
      Total de códigos: {codesData.length}
    </div>
  )

  const renderActionBody = (rowData) => {
    const currentDate = new Date().toISOString().split('T')[0]
    const isExpired = rowData.date_exp && (rowData.date_exp > currentDate)

    return (
      <div>
        <button 
          type="button" 
          className="btn btn-primary"
          onClick={() => handleCodeActivation(rowData)}
          disabled={isExpired}
        >
          Activar
        </button>
      </div>
    )
  }

  return (
    <>
      {isLoading ? (
        <p>Cargando datos...</p>
      ) : (
        <DataTable 
          value={codesData}
          dataKey="id"
          paginator
          showGridlines
          globalFilterFields={['nombre', 'producto', 'codigo', 'telefono', 'responsable']}
          globalFilter={globalFilter}
          rows={10}
          sortField="date"
          sortOrder={-1}
          stripedRows
          rowsPerPageOptions={[5, 10, 25, 50]}
          tableStyle={{ minWidth: '30rem', lineHeight: '1.5' }}
          className="custom_table"
          header={renderHeader()}
          footer={renderFooter()}
        >
          <Column field="codigo" header="Código" />
          <Column field="date" className="hidden" headerClassName='hidden' />
          <Column field="fecha_actual" bodyClassName="d-none d-xxl-table-cell" headerClassName="d-none d-xxl-table-cell" sortable header="Fecha Creación" />
          <Column field="hora_actual" sortable header="Hora Creación" />
          <Column field="activate_exp" bodyClassName="d-none d-xxl-table-cell" headerClassName="d-none d-xxl-table-cell" sortable header="Expiración Código" />
          <Column field="nombre" sortable header="Cliente" />
          <Column field="producto" sortable header="Producto" />
          <Column field="telefono" header="Teléfono" />
          <Column field="date_exp" header="Expiración Plan" />
          <Column field="actions" header="Acción" body={renderActionBody} />
        </DataTable>
      )}
    </>
  )
}

export default Codigos
