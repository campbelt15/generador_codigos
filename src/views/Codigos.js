import { useEffect, useState } from "react"
import '../assets/css/codigos_datatable.css'
import { DataTable } from 'primereact/datatable'
import { Column } from 'primereact/column'
import { InputText } from 'primereact/inputtext'

const Codigos = () => {
    const [data, setData] = useState([])
    const [globalFilter, setGlobalFilter] = useState(null)

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

    const actionBody = (
      <div>
        <button type="button" className="btn btn-primary">Activar</button>
      </div>
    )


    useEffect(() => {
      fetch('https://vbfz5r6da3.execute-api.us-east-1.amazonaws.com/dev/obtener_lista_codigos') // Reemplaza con la URL de tu API
        .then(response => response.json())
        .then(data => {
            const responseBody = JSON.parse(data.body)
            setData(responseBody.Items)
          })
        .catch(error => console.error('Error al cargar los datos:', error))
    }, [])


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
            <Column field="date" bodyClassName="fw-bold " sortable header="ID"></Column>
            <Column field="responsable" bodyClassName="" sortable header="Responsable"></Column>
            <Column field="codigo" bodyClassName="" header="Codigo" ></Column>
            <Column field="fecha_actual" bodyClassName="" sortable header="Fecha Creacion"></Column>
            <Column field="hora_actual" bodyClassName=""  header="Hora Creacion"></Column>
            <Column field="nombre" bodyClassName="" sortable header="Cliente"></Column>
            <Column field="producto" bodyClassName="" sortable header="Producto"></Column>
            <Column field="telefono" bodyClassName="" header="Telefono"></Column>
            <Column field="actions" header="Acción" body={actionBody}></Column>
        </DataTable>
    </>
  )
}

export default Codigos
