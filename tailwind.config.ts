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
        // Semantic color tokens using CSS variables
        'weather-bg': 'var(--bg)',
        'weather-bg-elev': 'var(--bg-elev)',
        'weather-border': 'var(--border)',
        'weather-text': 'var(--text)',
        'weather-muted': 'var(--text-muted)',
        'weather-primary': 'var(--primary)',
        'weather-accent': 'var(--accent)',
        'weather-ok': 'var(--ok)',
        'weather-warn': 'var(--warn)',
        'weather-danger': 'var(--danger)',
      },
      fontFamily: {
        'pixel': ['"Courier New"', '"Monaco"', '"Lucida Console"', 'monospace'],
      },
      animation: {
        'pulse-glow': 'pulseGlow 2s ease-in-out infinite',
        'slide-in': 'slideIn 0.5s ease-out forwards',
      },
      keyframes: {
        pulseGlow: {
          '0%, 100%': { 
            textShadow: '0 0 8px currentColor, 0 0 16px currentColor',
            transform: 'scale(1)'
          },
          '50%': { 
            textShadow: '0 0 12px currentColor, 0 0 24px currentColor, 0 0 36px currentColor',
            transform: 'scale(1.02)'
          },
        },
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
