import React from 'react'
import ReactDOM from 'react-dom/client'
import App from './App.jsx'
import './index.css'

const root = document.documentElement
const storedTheme = localStorage.getItem('theme')
const prefersDark = window.matchMedia('(prefers-color-scheme: dark)')
const resolveTheme = () => {
  if (storedTheme === 'dark' || storedTheme === 'light') return storedTheme
  return prefersDark.matches ? 'dark' : 'light'
}
root.setAttribute('data-theme', resolveTheme())
if (!storedTheme) {
  prefersDark.addEventListener('change', (event) => {
    root.setAttribute('data-theme', event.matches ? 'dark' : 'light')
  })
}

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>,
)
