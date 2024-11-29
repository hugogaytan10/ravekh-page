import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import svgr from 'vite-plugin-svgr';


// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react(),  svgr({
    svgrOptions: {
      exportAsDefault: true, // Configura la exportación como "default"
      icon: true, // Esto permite manejar SVGs como íconos automáticamente
    },
  }),],
  server: {
    host: true, // Permite que el servidor escuche en todas las interfaces de red
    port: 5173, // Puerto en el que correrá tu servidor (puedes cambiarlo si lo necesitas)
  }
})
