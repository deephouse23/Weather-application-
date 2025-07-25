import type { Config } from "tailwindcss"

const config: Config = {
  darkMode: ["class"],
  content: [
    "./pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
    "./lib/**/*.{js,ts,jsx,tsx,mdx}",
    "*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        // Consistent cyan theme colors
        'weather': {
          // Dark theme
          'dark': {
            'bg': '#0a0a1a',
            'bg-secondary': '#0f0f0f',
            'bg-tertiary': '#16213e',
            'primary': '#00FFFF',
            'text': '#e0e0e0',
            'text-secondary': '#00FFFF',
            'accent': '#00FFFF',
            'border': '#00FFFF',
            'gradient-start': '#0a0a1a',
            'gradient-mid': '#16213e',
            'gradient-end': '#1a1a2e'
          },
          // Miami theme
          'miami': {
            'bg': '#0a0025',
            'bg-secondary': '#2d1b69',
            'bg-tertiary': '#4a0e4e',
            'primary': '#00FFFF',
            'text': '#00FFFF',
            'text-secondary': '#00FFFF',
            'accent': '#00FFFF',
            'border': '#00FFFF',
            'gradient-start': '#0a0025',
            'gradient-mid': '#2d1b69',
            'gradient-end': '#4a0e4e'
          },
          // Tron theme
          'tron': {
            'bg': '#000000',
            'bg-secondary': '#000000',
            'bg-tertiary': '#0a0a0a',
            'primary': '#00FFFF',
            'text': '#FFFFFF',
            'text-secondary': '#00FFFF',
            'accent': '#00FFFF',
            'border': '#00FFFF',
            'gradient-start': '#000000',
            'gradient-mid': '#0a0a0a',
            'gradient-end': '#001111'
          }
        }
      },
      backgroundImage: {
        'gradient-dark': 'linear-gradient(135deg, #0a0a1a 0%, #16213e 25%, #1a1a2e 50%, #16213e 75%, #0a0a1a 100%)',
        'gradient-miami': 'linear-gradient(135deg, #0a0025 0%, #2d1b69 25%, #4a0e4e 50%, #2d1b69 75%, #0a0025 100%)',
        'gradient-tron': 'linear-gradient(135deg, #000000 0%, #0a0a0a 25%, #001111 50%, #0a0a0a 75%, #000000 100%)',
        'card-dark': 'linear-gradient(135deg, #0a0a1a 0%, #16213e 50%, #0f0f0f 100%)',
        'card-miami': 'linear-gradient(135deg, #0a0025 0%, #2d1b69 30%, #4a0e4e 70%, #2d1b69 100%)',
        'card-tron': 'linear-gradient(135deg, #000000 0%, #0a0a0a 30%, #001111 70%, #000000 100%)',
        'text-dark': 'linear-gradient(90deg, #00FFFF 0%, #00FFFF 50%, #00FFFF 100%)',
        'text-miami': 'linear-gradient(90deg, #00FFFF 0%, #00FFFF 50%, #00FFFF 100%)',
        'text-tron': 'linear-gradient(90deg, #00FFFF 0%, #00FFFF 50%, #00FFFF 100%)'
      },
      fontFamily: {
        'pixel': ['"Courier New"', '"Monaco"', '"Lucida Console"', 'monospace'],
      },
      animation: {
        'slide-in': 'slideIn 0.5s ease-out forwards',
      },
      keyframes: {
        slideIn: {
          'from': { 
            opacity: '0', 
            transform: 'translateY(20px)' 
          },
          'to': { 
            opacity: '1', 
            transform: 'translateY(0)' 
          },
        },
      },
      spacing: {
        'touch': '44px',
      },
      fontSize: {
        'responsive-sm': 'clamp(0.75rem, 2vw, 0.875rem)',
        'responsive-base': 'clamp(0.875rem, 2.5vw, 1rem)',
        'responsive-lg': 'clamp(1rem, 3vw, 1.25rem)',
        'responsive-xl': 'clamp(1.25rem, 4vw, 1.5rem)',
        'responsive-2xl': 'clamp(1.5rem, 5vw, 2rem)',
      },
      screens: {
        'mobile': {'max': '640px'},
        'tablet': {'min': '641px', 'max': '1024px'},
        'desktop': {'min': '1025px'},
      },
    },
  },
  plugins: [],
}
export default config
