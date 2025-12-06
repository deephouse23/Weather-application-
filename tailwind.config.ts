import type { Config } from "tailwindcss"

const config: Config = {
	darkMode: "class",
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
				background: 'hsl(var(--background))',
				foreground: 'hsl(var(--foreground))',
				card: {
					DEFAULT: 'hsl(var(--card))',
					foreground: 'hsl(var(--card-foreground))'
				},
				popover: {
					DEFAULT: 'hsl(var(--popover))',
					foreground: 'hsl(var(--popover-foreground))'
				},
				primary: {
					DEFAULT: 'hsl(var(--primary))',
					foreground: 'hsl(var(--primary-foreground))'
				},
				secondary: {
					DEFAULT: 'hsl(var(--secondary))',
					foreground: 'hsl(var(--secondary-foreground))'
				},
				muted: {
					DEFAULT: 'hsl(var(--muted))',
					foreground: 'hsl(var(--muted-foreground))'
				},
				accent: {
					DEFAULT: 'hsl(var(--accent))',
					foreground: 'hsl(var(--accent-foreground))'
				},
				destructive: {
					DEFAULT: 'hsl(var(--destructive))',
					foreground: 'hsl(var(--destructive-foreground))'
				},
				border: 'hsl(var(--border))',
				input: 'hsl(var(--input))',
				ring: 'hsl(var(--ring))',
				chart: {
					'1': 'hsl(var(--chart-1))',
					'2': 'hsl(var(--chart-2))',
					'3': 'hsl(var(--chart-3))',
					'4': 'hsl(var(--chart-4))',
					'5': 'hsl(var(--chart-5))'
				}
			},
			fontFamily: {
				pixel: [
					'Courier New"',
					'Monaco"',
					'Lucida Console"',
					'monospace'
				]
			},
			animation: {
				'pulse-glow': 'pulseGlow 2s ease-in-out infinite',
				'slide-in': 'slideIn 0.5s ease-out forwards'
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
					}
				},
				slideIn: {
					from: {
						opacity: '0',
						transform: 'translateY(20px)'
					},
					to: {
						opacity: '1',
						transform: 'translateY(0)'
					}
				}
			},
			spacing: {
				touch: '44px'
			},
			fontSize: {
				'responsive-sm': 'clamp(0.75rem, 2vw, 0.875rem)',
				'responsive-base': 'clamp(0.875rem, 2.5vw, 1rem)',
				'responsive-lg': 'clamp(1rem, 3vw, 1.25rem)',
				'responsive-xl': 'clamp(1.25rem, 4vw, 1.5rem)',
				'responsive-2xl': 'clamp(1.5rem, 5vw, 2rem)'
			},
			screens: {
				mobile: {
					max: '640px'
				},
				tablet: {
					min: '641px',
					max: '1024px'
				},
				desktop: {
					min: '1025px'
				}
			},
			borderRadius: {
				lg: 'var(--radius)',
				md: 'calc(var(--radius) - 2px)',
				sm: 'calc(var(--radius) - 4px)'
			}
		}
	},
	plugins: [require("tailwindcss-animate")],
}
export default config
