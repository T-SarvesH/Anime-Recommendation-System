/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,jsx,ts,tsx}"
  ],
  theme: {
    extend: {

      colors:{

        'anime-bg': '#1F2937',          
        'anime-card': '#374151',        
        'anime-text-light': '#F3F4F6',  
        'anime-text-dark': '#D1D5DB',   
        'anime-accent': '#6EE7B7',      
        'anime-accent-dark': '#10B981', 
        'anime-border': '#4B5563',      
        'anime-error': '#EF4444',  
      },

      fontFamily:{

        'sans': ['Roboto', 'sans-serif'],
      },

      boxShadow:{

        'anime-glow': '0 0 15px rgba(110, 231, 183, 0.4)',
      }
    },
  },
  plugins: [],
}

