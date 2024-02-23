import { useEffect, useState } from "react"
import swal from "sweetalert"
import '../assets/css/codigos_datatable.css'
import { DataTable } from 'primereact/datatable'
import { Column } from 'primereact/column'
import { InputText } from 'primereact/inputtext'

const Usuario = () => {
    const reactivateApi = process.env.REACT_APP_REACTIVATE_API
    const [data, setData] = useState([])
    const [globalFilter, setGlobalFilter] = useState(null)

    const loadData = () => {
      fetch('https://vbfz5r6da3.execute-api.us-east-1.amazonaws.com/dev/obtener_lista_codigos')
        .then(response => response.json())
        .then(data => {
          const responseBody = JSON.parse(data.body)
          setData(responseBody.Items)
        })
        .catch(error => console.error('Error al cargar los datos:', error))
    }
    
    useEffect(() => {
      loadData()
    }, [])

    const handleActivateClick = async (itemData) => {
      try {
        const response = await fetch(
          reactivateApi,
          {
            method: "POST",
            headers: {
              "Content-Type": "application/json"
            },
            body: JSON.stringify(itemData)
          }
        )

        if (response.ok) {
          swal({
            title: "Reactivado",
            text: "Reactivado correctamente.",
            icon: "success",
            button: "OK",
            timer: "3000"
          })
          loadData()
        } else {
          swal({
            title: "Error al reactivar",
            text: response.statusText,
            icon: "warning",
            button: "OK",
            timer: "3000"
          })

        }
      } catch (error) {
        // Manejar errores aquí
        console.error("Error al actualizar los datos", error)
      }
    }

    const header = (
      <div className="fs-2 mb-3">
        Lista de Códigos
        <span className="p-input-icon-left ms-2">
          <i className="pi pi-search" />
          <InputText 
          type="search" 
          onInput={(e) => setGlobalFilter(e.target.value)} placeholder="Buscar..." />
        </span>
      </div>
    )
    
    
    const footer = (
      <div className="table-footer">
        Total de códigos: {data.length}
      </div>
    )

    const actionBody = (rowData) => {
      return (
        <div>
          <button 
            type="button" 
            className="btn btn-primary"
            onClick={() => handleActivateClick(rowData)}
          >
            Activar
          </button>
        </div>
      )
    }

  return (
    <>

      <DataTable 
          value={data}
          dataKey="id"
          paginator
          showGridlines
          globalFilterFields={['nombre', 'producto', 'codigo', 'telefono', 'responsable']}//agregar los tipos de busqueda
          globalFilter={globalFilter}
          rows={10}
          sortField="date"
          sortOrder={-1}
          stripedRows
          rowsPerPageOptions={[5, 10, 25, 50]}
          tableStyle={{ minWidth: '50rem', lineHeight: '1.5' }}
          className="table"
          header={header}
          footer={footer}
        >
            
            {/* <Column field="responsable" className="d-none d-xxl-table-cell me-1" headerClassName="d-none d-xxl-table-cell" sortable header="Responsable"></Column> */}
            <Column field="codigo" bodyClassName="" header="Código" ></Column>
            <Column field="fecha_actual" className="d-none d-xxl-table-cell" headerClassName="d-none d-xxl-table-cell" sortable header="Fecha Creación"></Column>
            {/* <Column field="hora_actual" bodyClassName="" sortable header="Hora Creación"></Column> */}
            <Column field="activate_exp" className="d-none d-xxl-table-cell" headerClassName="d-none d-xxl-table-cell" sortable header="Expiración Código"></Column>
            <Column field="nombre" bodyClassName="" sortable header="Cliente"></Column>
            <Column field="producto" bodyClassName="" sortable header="Producto"></Column>
            <Column field="telefono" bodyClassName="" header="Teléfono"></Column>
            <Column field="date_exp" bodyClassName="" header="Expiración Plan"></Column>
            <Column field="actions" header="Acción" body={actionBody}></Column>
            <Column field="date" bodyClassName="hidden" ></Column>
        </DataTable>
    </>
  )
}

export default Usuario
