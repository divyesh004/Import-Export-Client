/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      screens: {
        'xs': '480px',
      },
      colors: {
        primary: {
          // Flipkart Blue
          50: '#e6f0fd',
          100: '#cce0fb',
          200: '#99c2f7',
          300: '#66a3f3',
          400: '#3385ef',
          500: '#2874F0', // Flipkart Primary Blue
          600: '#1c5dcc',
          700: '#1547a3',
          800: '#0e317b',
          900: '#071a52',
          950: '#040f33',
        },
        secondary: {
          // Light Gray
          50: '#FFFFFF', // White
          100: '#f5f7fa',
          200: '#ebeef3',
          300: '#dde3ec',
          400: '#b0b9c6',
          500: '#8896a6', // Secondary Gray
          600: '#5e6b7b',
          700: '#455163',
          800: '#323c4d',
          900: '#1f2937', // Text Color
          950: '#111827',
        },
        accent: {
          // Bright Orange
          50: '#fff5f0',
          100: '#ffede5',
          200: '#ffd9cc',
          300: '#ffc0a8',
          400: '#ff9466',
          500: '#ff6600', // Bright Orange
          600: '#e65c00',
          700: '#cc5200',
          800: '#a34200',
          900: '#7a3100',
          950: '#4d1f00',
        },
        success: {
          // Green
          50: '#ecfef5',
          100: '#d1fddf',
          200: '#a3f9c0',
          300: '#6eeea0',
          400: '#34db7b', // Success Green
          500: '#10b981',
          600: '#059669',
          700: '#047857',
          800: '#065f46',
          900: '#064e3b',
          950: '#022c22',
        },
        error: {
          // Orange
          50: '#fff7ed',
          100: '#ffedd5',
          200: '#fed7aa',
          300: '#fdba74',
          400: '#F09120', // Flipkart Orange
          500: '#f97316',
          600: '#ea580c',
          700: '#c2410c',
          800: '#9a3412',
          900: '#7c2d12',
          950: '#431407',
        }
      },
      fontFamily: {
        sans: ['Inter', 'sans-serif'],
      },
      keyframes: {
        fadeIn: {
          '0%': { opacity: '0', transform: 'translateY(-10px)' },
          '100%': { opacity: '1', transform: 'translateY(0)' },
        },
      },
      animation: {
        fadeIn: 'fadeIn 0.2s ease-out',
      },
    },
  },
  plugins: [],
}