
import { createContext, useContext, useState } from "react"

const SchemesContext = createContext()

export const SchemesProvider = ({ children }) => {
  const [schemes, setSchemes] = useState([])

  return (
    <SchemesContext.Provider value={{ schemes, setSchemes }}>
      {children}
    </SchemesContext.Provider>
  )
}

export const useSchemes = () => useContext(SchemesContext)
