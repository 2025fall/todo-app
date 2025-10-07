import React from 'react'
import ReactDOM from 'react-dom/client'
import App from './App.tsx'
import ThemeProvider from './components/ThemeProvider.tsx'
import './index.css'
import { devLog, devError } from './utils/devLogger'

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <ThemeProvider>
      <App />
    </ThemeProvider>
  </React.StrictMode>,
)

if ('serviceWorker' in navigator) {
  window.addEventListener('load', () => {
    navigator.serviceWorker
      .register('/service-worker.js')
      .then((registration) => {
        devLog('Service worker registered:', registration.scope)
      })
      .catch((error) => {
        devError('Service worker registration failed:', error)
      })
  })
}
