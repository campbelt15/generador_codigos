import React, { Suspense } from "react"
import UserPool from "./UserPool"

// ** Router Import
import Router from "./router/Router"

const App = () => {
  return (
    <Suspense fallback={null}>
      <Router />
    </Suspense>
  )
}

export default App
