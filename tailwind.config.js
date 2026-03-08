/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  theme: {
    extend: {
      fontFamily: {
        sans: ['"Plus Jakarta Sans"', 'system-ui', '-apple-system', 'sans-serif'],
      },
      colors: {
        warm: {
          bg: '#FAFAF8',
          surface: '#F5F4F0',
          surface2: '#EEECEA',
          border: '#E8E6E1',
          black: '#1C1917',
        },
        stone: {
          950: '#0C0A09',
        }
      },
      borderRadius: {
        'ios-xs': '6px',
        'ios-sm': '10px',
        'ios-md': '14px',
        'ios-lg': '18px',
        'ios-xl': '22px',
        'ios-2xl': '28px',
      },
      boxShadow: {
        'ios-sm': '0 1px 3px rgba(0,0,0,0.04), 0 4px 12px rgba(0,0,0,0.04)',
        'ios-md': '0 4px 16px rgba(0,0,0,0.06), 0 1px 4px rgba(0,0,0,0.04)',
        'ios-lg': '0 8px 32px rgba(0,0,0,0.08), 0 2px 8px rgba(0,0,0,0.04)',
      },
      backgroundImage: {
        'warm-gradient': 'linear-gradient(135deg, #FAFAF8 0%, #F5F4F0 100%)',
      },
    },
  },
  plugins: [],
}