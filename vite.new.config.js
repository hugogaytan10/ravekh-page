import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import svgr from "vite-plugin-svgr";

export default defineConfig({
  resolve: {
    alias: {
      "qrcode.react": "/src/qrcode-react-shim.tsx",
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
    host: true,
    port: 5174,
  },
  build: {
    rollupOptions: {
      input: "/src/new-main.jsx",
    },
  },
});
