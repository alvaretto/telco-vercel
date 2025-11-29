/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        // Nueva paleta de colores moderna MVP 2025
        brand: {
          // Colores primarios refinados
          blue: '#0052FF',       // Azul vibrante (más saturado)
          indigo: '#6366F1',     // Indigo moderno
          violet: '#8B5CF6',     // Violeta para acentos
          red: '#EF4444',        // Rojo más suave
          coral: '#F97316',      // Coral para advertencias
          
          // Tonos oscuros premium
          dark: '#0F0F1A',       // Negro azulado profundo
          darker: '#080810',     // Negro casi puro
          slate: '#1E1E2E',      // Gris azulado elegante
          
          // Acentos de éxito/estado
          emerald: '#10B981',    // Verde éxito
          cyan: '#06B6D4',       // Cyan para info
          
          // Neutros
          white: '#FFFFFF',
          muted: '#94A3B8',      // Gris para texto secundario
        },
      },
      fontFamily: {
        sans: ['Open Sauce One', 'Inter', 'system-ui', 'sans-serif'],
      },
      animation: {
        'fadeInDown': 'fadeInDown 0.4s ease-out',
        'fadeInUp': 'fadeInUp 0.5s ease-out',
        'slideIn': 'slideIn 0.3s ease-out',
        'pulse-slow': 'pulse 3s cubic-bezier(0.4, 0, 0.6, 1) infinite',
        'float': 'float 6s ease-in-out infinite',
        'glow': 'glow 2s ease-in-out infinite alternate',
        'shimmer': 'shimmer 2s linear infinite',
      },
      keyframes: {
        fadeInDown: {
          '0%': { opacity: '0', transform: 'translateY(-20px)' },
          '100%': { opacity: '1', transform: 'translateY(0)' },
        },
        fadeInUp: {
          '0%': { opacity: '0', transform: 'translateY(20px)' },
          '100%': { opacity: '1', transform: 'translateY(0)' },
        },
        slideIn: {
          '0%': { opacity: '0', transform: 'translateX(-10px)' },
          '100%': { opacity: '1', transform: 'translateX(0)' },
        },
        float: {
          '0%, 100%': { transform: 'translateY(0)' },
          '50%': { transform: 'translateY(-10px)' },
        },
        glow: {
          '0%': { boxShadow: '0 0 5px rgba(99, 102, 241, 0.3)' },
          '100%': { boxShadow: '0 0 20px rgba(99, 102, 241, 0.6)' },
        },
        shimmer: {
          '0%': { backgroundPosition: '-200% 0' },
          '100%': { backgroundPosition: '200% 0' },
        },
      },
      backgroundImage: {
        // Gradientes modernos mejorados
        'brand-gradient': 'linear-gradient(135deg, #0052FF 0%, #8B5CF6 50%, #EC4899 100%)',
        'brand-gradient-soft': 'linear-gradient(135deg, rgba(0, 82, 255, 0.15) 0%, rgba(139, 92, 246, 0.15) 100%)',
        'brand-gradient-vivid': 'linear-gradient(135deg, #6366F1 0%, #A855F7 50%, #EC4899 100%)',
        'dark-gradient': 'linear-gradient(180deg, #0F0F1A 0%, #1E1E2E 100%)',
        'glass-gradient': 'linear-gradient(135deg, rgba(255,255,255,0.1) 0%, rgba(255,255,255,0.05) 100%)',
        'mesh-gradient': 'radial-gradient(at 40% 20%, #6366F1 0px, transparent 50%), radial-gradient(at 80% 80%, #0052FF 0px, transparent 50%)',
      },
      boxShadow: {
        'glow-sm': '0 0 15px -3px rgba(99, 102, 241, 0.4)',
        'glow-md': '0 0 25px -5px rgba(99, 102, 241, 0.5)',
        'glow-lg': '0 0 35px -5px rgba(99, 102, 241, 0.6)',
        'glow-blue': '0 0 30px -5px rgba(0, 82, 255, 0.5)',
        'glow-violet': '0 0 30px -5px rgba(139, 92, 246, 0.5)',
        'inner-glow': 'inset 0 0 20px rgba(99, 102, 241, 0.1)',
        'card': '0 4px 6px -1px rgba(0, 0, 0, 0.3), 0 2px 4px -2px rgba(0, 0, 0, 0.2)',
        'card-hover': '0 20px 40px -15px rgba(0, 0, 0, 0.5), 0 0 30px -10px rgba(99, 102, 241, 0.3)',
      },
      backdropBlur: {
        xs: '2px',
      },
      borderRadius: {
        '4xl': '2rem',
        '5xl': '2.5rem',
      },
    },
  },
  plugins: [],
}
