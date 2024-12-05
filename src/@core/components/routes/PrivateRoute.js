// ** React Imports
import { Navigate } from "react-router-dom"
import { useContext, Suspense } from "react"
import LayoutWrapper from "@src/@core/layouts/components/layout-wrapper"

// ** Context Imports
import { AbilityContext } from "@src/utility/context/Can"

// ** Helper para validar token
import jwtDecode from "jwt-decode"

// Función para validar si el token es válido
const isTokenValid = () => {
  const token = sessionStorage.getItem("sessionToken") // Verifica si hay un token en sessionStorage
  if (!token) return false

  try {
    const decodedToken = jwtDecode(token) // Decodifica el token JWT
    const currentTime = Math.floor(Date.now() / 1000) // Obtiene el tiempo actual en segundos

    // Verifica si el token no ha expirado (incluye igualdad en el tiempo)
    return decodedToken.exp >= currentTime
  } catch (err) {
    console.error("Token inválido o error al decodificar:", err)
    return false
  }
}

const PrivateRoute = ({ children, route }) => {
  // ** Contexto de permisos
  const ability = useContext(AbilityContext)

  // ** Verifica token y usuario
  // const user = JSON.parse(localStorage.getItem("userData"))

  const tokenIsValid = isTokenValid()

  // ** Bloquea si no hay token o usuario
  if (!tokenIsValid) {
    // Limpia cualquier dato residual
    sessionStorage.removeItem("sessionToken")
    localStorage.removeItem("userData")
    return <Navigate to="/login" />
  }

  // ** Si se pasa una ruta con metadatos
  if (route) {
    const { action = "read", resource, restricted } = route.meta || {}

    // Bloquear si es una ruta restringida para el rol
    if (restricted) {
      return <Navigate to="/access-control" />
    }

    // Verificar si el usuario tiene permisos con `ability`
    if (!ability.can(action, resource)) {
      return <Navigate to="/misc/not-authorized" replace />
    }
  }

  // Renderizar el contenido si todas las validaciones se cumplen
  // En lugar de usar Suspense directamente en el PrivateRoute,
  // intenta envolver la ruta y los layouts como esto:
  return (
    <LayoutWrapper>
      <Suspense fallback={<div>Loading...</div>}>{children}</Suspense>
    </LayoutWrapper>
  )
}

export default PrivateRoute
