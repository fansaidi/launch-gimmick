import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { HashRouter } from 'react-router-dom'
import './index.css'
import App from './App.tsx'

// GitHub Pages serves static files with no server-side rewrite, so a
// direct link or reload on e.g. /flows/abc123 would 404 under a history
// router. HashRouter keeps all client-side routes after a # fragment,
// which the static host never sees.
createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <HashRouter>
      <App />
    </HashRouter>
  </StrictMode>,
)
