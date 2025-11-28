/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        // Colores de marca Cliente Insight
        brand: {
          blue: '#0037FF',      // Azul principal
          red: '#fd371d',       // Rojo para degradados
          dark: '#363333',      // Gris oscuro
          black: '#000000',     // Negro
          white: '#FFFFFF',     // Blanco
        },
      },
      fontFamily: {
        sans: ['Open Sauce One', 'Open Sans', 'system-ui', 'sans-serif'],
      },
      animation: {
        'fadeInDown': 'fadeInDown 0.3s ease-out',
      },
      keyframes: {
        fadeInDown: {
          '0%': { opacity: '0', transform: 'translateY(-10px)' },
          '100%': { opacity: '1', transform: 'translateY(0)' },
        },
      },
      backgroundImage: {
        'brand-gradient': 'linear-gradient(120deg, #0037FF 0%, #fd371d 100%)',
        'brand-gradient-soft': 'linear-gradient(120deg, rgba(0, 55, 255, 0.8) 0%, rgba(253, 55, 29, 0.8) 100%)',
      },
    },
  },
  plugins: [],
}