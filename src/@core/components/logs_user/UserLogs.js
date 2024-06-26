const insertLogsApi = process.env.REACT_APP_INSERT_LOG_API

const UserLogs = async (accion, codigo, detalle, ip, email) => {
          // Para enviar logs
          const data = {
            accion,
            codigo,
            detalle,
            ip,
            responsable: email
          }
  
          try {
            const response = await fetch(
              insertLogsApi,
              {
                method: "POST",
                headers: {
                  "Content-Type": "application/json"
                },
                body: JSON.stringify(data)
              }
            )
  
            if (response.ok) {
              // console.log('dentro del response')
            }
            
          } catch (error) {
    
            console.error(error)
          }
  
  }
  
  export default UserLogs
  