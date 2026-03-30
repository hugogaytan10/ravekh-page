import React from 'react'
import ReactDOM from 'react-dom/client'
import App from './App.jsx'
import './index.css'

const root = document.documentElement
const LEGACY_THEME_KEY = 'theme'
const POS_V2_THEME_KEY = 'pos-v2-ui-theme'
const storedTheme = localStorage.getItem(POS_V2_THEME_KEY) ?? localStorage.getItem(LEGACY_THEME_KEY)
const resolveTheme = () => {
  if (storedTheme === 'dark' || storedTheme === 'light') return storedTheme
  return 'light'
}
root.setAttribute('data-theme', resolveTheme())

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>,
)
