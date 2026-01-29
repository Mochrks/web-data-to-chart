import type { Config } from "tailwindcss";

const config: Config = {
    darkMode: ["class"],
  content: [
    "./pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
  	extend: {
      fontFamily: {
        sans: ['Inter', 'sans-serif'],
      },
  		colors: {
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
  			},
            // Custom Colors from Redesign
            'glass-border': 'rgba(255, 255, 255, 0.2)',
            'glass-bg': 'rgba(255, 255, 255, 0.05)',
            'clay-light': '#f0f0f3',
            'cream-bg': '#F5F2EB',
            'soft-gray': '#E8E8E8',
            'primary-purple': '#8B5CF6',
            'primary-purple-dark': '#7C3AED',
            'accent-orange': '#F97316',
            'accent-red': '#EF4444',
            'accent-blue': '#3B82F6',
            'accent-pink': '#EC4899',
  		},
  		borderRadius: {
  			lg: 'var(--radius)',
  			md: 'calc(var(--radius) - 2px)',
  			sm: 'calc(var(--radius) - 4px)',
            'xl-custom': '20px',
  		},
        boxShadow: {
            'clay': 'inset -3px -3px 7px rgba(255, 255, 255, 0.5), inset 3px 3px 5px rgba(0, 0, 0, 0.1), 5px 5px 15px rgba(0,0,0,0.2)',
            'glass': '0 8px 32px 0 rgba(0, 0, 0, 0.37)',
            'glow-text': '0 0 20px rgba(255,255,255,0.3)',
            // Neumorphic Shadows
            'neumorphic-sm': '6px 6px 12px #d1d1d1, -6px -6px 12px #ffffff',
            'neumorphic-md': '6px 6px 12px #d1d1d1, -6px -6px 12px #ffffff',
            'neumorphic-lg': '8px 8px 16px #d9d7d4, -8px -8px 16px #ffffff',
            'neumorphic-inset': 'inset 3px 3px 6px #d9d7d4, inset -3px -3px 6px #ffffff',
            'card-selected': 'inset 0 0 10px rgba(139, 92, 246, 0.2)',
        }
  	}
  },
  plugins: [require("tailwindcss-animate")],
};
export default config;
