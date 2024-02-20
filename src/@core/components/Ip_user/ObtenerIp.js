const ObtenerIP = async () => {
  const optenerIP_API = process.env.REACT_APP_OBTENER_IP_API

    try {
      const respuesta = await fetch(optenerIP_API)
      if (!respuesta.ok) {
        throw new Error('No se pudo obtener la dirección IP')
      }
      const datos = await respuesta.json()
      return datos.ip
    } catch (error) {
      console.error('Error al obtener la IP:', error)
      return null // O maneja el error como prefieras
    }
  }
  
  export default ObtenerIP
  