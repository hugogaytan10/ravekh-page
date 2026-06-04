import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import svgr from 'vite-plugin-svgr'

// https://vite.dev/config/
export default defineConfig({
  envPrefix: ['VITE_', 'FACTURA_ELECTRONICA_API_URL'],
  resolve: {
    alias: {
      'qrcode.react': '/src/qrcode-react-shim.tsx',
    },
  },
  plugins: [
    react(),
    svgr({
      svgrOptions: {
        exportAsDefault: true,
        icon: true,
      },
    }),
  ],
  server: {
    host: '0.0.0.0',
    port: 5173,
    strictPort: true,
    allowedHosts: [
      'malachi-overeducative-tai.ngrok-free.dev',
    ],
  },
})