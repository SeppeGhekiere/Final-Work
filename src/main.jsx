import { createRoot } from 'react-dom/client'
import { HelmetProvider } from "react-helmet-async";
import { BrowserRouter } from "react-router-dom";
import './styles/variables.css'
import './styles/reset.css'
import './styles/nav.css'
import './styles/homepage.css'
import './styles/project-page.css'
import './styles/info-page.css'
import './styles/game.css'
import App from './App.jsx'

createRoot(document.getElementById('root')).render(
  <HelmetProvider>
    <BrowserRouter>
      <App />
    </BrowserRouter>
  </HelmetProvider>
)
