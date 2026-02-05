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
		container: {
			center: true,
			padding: "2rem",
			screens: {
				"2xl": "1400px",
			},
		},
		extend: {
			colors: {
				border: {
					DEFAULT: "hsl(var(--border))",
					subtle: "hsl(var(--border-subtle))",
					medium: "hsl(var(--border-medium))",
					strong: "hsl(var(--border-strong))",
				},
				input: "hsl(var(--input))",
				ring: "hsl(var(--ring))",
				background: "hsl(var(--background))",
				foreground: "hsl(var(--foreground))",
				primary: {
					DEFAULT: "hsl(var(--primary))",
					foreground: "hsl(var(--primary-foreground))",
				},
				secondary: {
					DEFAULT: "hsl(var(--secondary))",
					foreground: "hsl(var(--secondary-foreground))",
				},
				destructive: {
					DEFAULT: "hsl(var(--destructive))",
					foreground: "hsl(var(--destructive-foreground))",
				},
				muted: {
					DEFAULT: "hsl(var(--muted))",
					foreground: "hsl(var(--muted-foreground))",
				},
				accent: {
					DEFAULT: "hsl(var(--accent))",
					foreground: "hsl(var(--accent-foreground))",
				},
				popover: {
					DEFAULT: "hsl(var(--popover))",
					foreground: "hsl(var(--popover-foreground))",
				},
				card: {
					DEFAULT: "hsl(var(--card))",
					foreground: "hsl(var(--card-foreground))",
				},
				/* Legacy Theme Colors Preserved */
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
				/* Terminal Design System Colors */
				'terminal': {
					'bg': {
						'primary': 'var(--terminal-bg-primary)',
						'secondary': 'var(--terminal-bg-secondary)',
						'elevated': 'var(--terminal-bg-elevated)',
						'surface': 'var(--terminal-bg-surface)',
					},
					'text': {
						'primary': 'var(--terminal-text-primary)',
						'secondary': 'var(--terminal-text-secondary)',
						'muted': 'var(--terminal-text-muted)',
					},
					'accent': {
						DEFAULT: 'var(--terminal-accent-primary)',
						'primary': 'var(--terminal-accent-primary)',
						'secondary': 'var(--terminal-accent-secondary)',
						'info': 'var(--terminal-accent-info)',
						'success': 'var(--terminal-accent-success)',
						'warning': 'var(--terminal-accent-warning)',
						'danger': 'var(--terminal-accent-danger)',
					},
					'border': {
						DEFAULT: 'var(--terminal-border)',
						'focus': 'var(--terminal-border-focus)',
					},
					'weather': {
						'hot': 'var(--terminal-temp-hot)',
						'cold': 'var(--terminal-temp-cold)',
						'precip': 'var(--terminal-precip)',
						'wind': 'var(--terminal-wind)',
						'uv': 'var(--terminal-uv)',
					},
				},
			},
			borderRadius: {
				lg: "var(--radius)",
				md: "calc(var(--radius) - 2px)",
				sm: "calc(var(--radius) - 4px)",
			},
			boxShadow: {
				'glow-subtle': 'var(--glow-subtle)',
				'glow-medium': 'var(--glow-medium)',
				'glow-strong': 'var(--glow-strong)',
			},
			keyframes: {
				"accordion-down": {
					from: { height: "0" },
					to: { height: "var(--radix-accordion-content-height)" },
				},
				"accordion-up": {
					from: { height: "var(--radix-accordion-content-height)" },
					to: { height: "0" },
				},
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
			animation: {
				"accordion-down": "accordion-down 0.2s ease-out",
				"accordion-up": "accordion-up 0.2s ease-out",
				'pulse-glow': 'pulseGlow 2s ease-in-out infinite',
				'slide-in': 'slideIn 0.5s ease-out forwards'
			},
			fontFamily: {
				sans: ['Inconsolata', 'monospace'],
				mono: ['Inconsolata', 'monospace'],
				display: ['VT323', 'monospace'],
			},
			fontWeight: {
				light: '300',
				normal: '400',
				medium: '500',
				semibold: '600',
				bold: '700',
				extrabold: '800',
				black: '800',
			},
			fontSize: {
				'responsive-sm': 'clamp(0.75rem, 2vw, 0.875rem)',
				'responsive-base': 'clamp(0.875rem, 2.5vw, 1rem)',
				'responsive-lg': 'clamp(1rem, 3vw, 1.25rem)',
				'responsive-xl': 'clamp(1.25rem, 4vw, 1.5rem)',
				'responsive-2xl': 'clamp(1.5rem, 5vw, 2rem)'
			},
			spacing: {
				touch: '44px'
			},
			screens: {
				mobile: { max: '640px' },
				tablet: { min: '641px', max: '1024px' },
				desktop: { min: '1025px' }
			},
		},
	},
	plugins: [require("tailwindcss-animate")],
}
export default config
