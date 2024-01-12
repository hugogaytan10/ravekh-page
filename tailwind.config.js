/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors:{
        'azul-banner': 'rgb(228, 102, 0)',
        'negro': '#252424',
        'azul-celeste': '#00F2EA',
        'rojo-claro': '#FF0050',
        'bordes': '#00B8F2',
        'contenedor-info': 'rgb(21,26,30)',
        'bg-contacto': '#162436',
        'fondo-oscuro': '#252424',
        'color-whats': '#25D366'
      },
    },
  },
  plugins: [require("daisyui")],
}

