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
        // 16-bit weather theme colors
        'weather': {
          // Dark theme
          'dark': {
            'bg': '#0a0a1a',
            'bg-secondary': '#0f0f0f',
            'bg-tertiary': '#16213e',
            'primary': '#00d4ff',
            'text': '#e0e0e0',
            'text-secondary': '#4ecdc4',
            'accent': '#ffe66d',
            'border': '#00d4ff'
          },
          // Miami theme
          'miami': {
            'bg': '#0a0025',
            'bg-secondary': '#2d1b69',
            'bg-tertiary': '#4a0e4e',
            'primary': '#ff1493',
            'text': '#00ffff',
            'text-secondary': '#22d3ee',
            'accent': '#ff1493',
            'border': '#ff1493'
          },
          // Tron theme
          'tron': {
            'bg': '#000000',
            'bg-secondary': '#000000',
            'bg-tertiary': '#0a0a0a',
            'primary': '#00FFFF',
            'text': '#FFFFFF',
            'text-secondary': '#88CCFF',
            'accent': '#00FFFF',
            'border': '#00FFFF'
          }
        }
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
