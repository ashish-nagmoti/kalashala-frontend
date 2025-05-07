import React from "react"
import ReactDOM from "react-dom/client"
import App from "./App.jsx"
import "./index.css"
import { ArtistsProvider } from "./context/ArtistsContext"
import { SchemesProvider } from "./context/SchemesContext"
import AuthProvider from "./context/AuthContext"

ReactDOM.createRoot(document.getElementById("root")).render(
  <React.StrictMode>
    <AuthProvider>
      <SchemesProvider>
        <ArtistsProvider>
          <App />
        </ArtistsProvider>
      </SchemesProvider>
    </AuthProvider>
  </React.StrictMode>,
)

