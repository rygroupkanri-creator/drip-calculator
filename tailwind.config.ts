import type { Config } from 'tailwindcss'

const config: Config = {
  content: [
    './src/pages/**/*.{js,ts,jsx,tsx,mdx}',
    './src/components/**/*.{js,ts,jsx,tsx,mdx}',
    './src/app/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      colors: {
        // Ver.2.0 パステルカラーパレット
        greige: {
          DEFAULT: '#F9F8F6',
          50: '#FFFFFF',
          100: '#F9F8F6',
          200: '#F5F3F0',
          300: '#EEEAE5',
          400: '#E5DFD8',
          500: '#D8D0C7',
        },
        sakura: {
          DEFAULT: '#FDE2E4',
          50: '#FFF5F6',
          100: '#FDE2E4',
          200: '#FBC4C8',
          300: '#F9A6AC',
          400: '#F78890',
          500: '#F56A74',
        },
        mint: {
          DEFAULT: '#E2F0CB',
          50: '#F5FAE8',
          100: '#E2F0CB',
          200: '#C8E4A0',
          300: '#AED875',
          400: '#94CC4A',
          500: '#7AB82F',
        },
        // 従来のプライマリカラーも残す（互換性のため）
        primary: {
          DEFAULT: '#F9A6AC',
          50: '#FFF5F6',
          100: '#FDE2E4',
          200: '#FBC4C8',
          300: '#F9A6AC',
          400: '#F78890',
          500: '#F56A74',
          600: '#F34C58',
          700: '#E62838',
          800: '#B81E2C',
          900: '#8A1621',
        },
      },
      fontFamily: {
        sans: ['"Noto Sans JP"', 'ui-sans-serif', 'system-ui', 'sans-serif'],
      },
      animation: {
        'pulse-ring': 'pulse-ring 0.6s cubic-bezier(0.4, 0, 0.6, 1)',
        'gentle-bounce': 'gentle-bounce 2s ease-in-out infinite',
      },
      keyframes: {
        'pulse-ring': {
          '0%': { transform: 'scale(0.8)', opacity: '1' },
          '100%': { transform: 'scale(1.5)', opacity: '0' },
        },
        'gentle-bounce': {
          '0%, 100%': { transform: 'translateY(0)' },
          '50%': { transform: 'translateY(-10px)' },
        },
      },
    },
  },
  plugins: [],
}
export default config
