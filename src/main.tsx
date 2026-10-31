import { StrictMode } from "react"
import { createRoot } from "react-dom/client"
import { BrowserRouter } from "react-router-dom"
import App from "./App"
import { AuthProvider } from "./lib/auth/AuthProvider"
import "./styles/global.css"
import "./styles/sitewide.css"
import "./styles/header.css"
import "./styles/admin.css"
import "./styles/signin.css"
import "./styles/bowlers.css"

createRoot(document.getElementById("root")!).render(
  <StrictMode>
    <BrowserRouter>
      <AuthProvider>
        <App />
      </AuthProvider>
    </BrowserRouter>
  </StrictMode>,
)
