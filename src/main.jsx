import React from 'react'
import ReactDOM from 'react-dom/client'
import App from './App.jsx'
import './index.css'

const root = document.documentElement
const POS_V2_THEME_KEY = 'pos-v2-ui-theme'
const resolveTheme = () => {
  const storedTheme = localStorage.getItem(POS_V2_THEME_KEY)
  if (storedTheme === 'dark' || storedTheme === 'light') return storedTheme
  if (window.matchMedia?.('(prefers-color-scheme: dark)').matches) return 'dark'
  return 'light'
}
root.setAttribute('data-theme', resolveTheme())

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>,
)
