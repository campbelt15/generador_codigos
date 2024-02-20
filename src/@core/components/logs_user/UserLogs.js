const insertLogsApi = process.env.REACT_APP_INSERT_LOG_API

const UserLogs = async (accion, detalle, ip, email) => {
          // Para enviar logs
          const data = {
            accion,
            detalle,
            ip,
            responsable: email
          }
  
          console.log(data)
  
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
              console.log('dentro del response')
              console.log(response)
            }
            
          } catch (error) {
    
            console.error(error)
          }
  
  }
  
  export default UserLogs
  