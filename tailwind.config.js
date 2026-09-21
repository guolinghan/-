/** @type {import('tailwindcss').Config} */
export default {
  darkMode: 'class',
  content: ['./index.html', './src/**/*.{vue,js,ts,jsx,tsx}'],
  theme: {
    extend: {
      colors: {
        forest: {
          50: '#eff7f4',
          100: '#dcece6',
          200: '#bad9ce',
          300: '#8ebfb0',
          400: '#609e8d',
          500: '#3b6b5f',
          600: '#315b51',
          700: '#294b44',
          800: '#223d38',
          900: '#1d332f'
        },
        canvas: '#f8faf8',
        ink: '#1f2937',
        night: '#121a19',
        sand: '#d9c7a7',
        sky: '#8eb6c9'
      },
      fontFamily: {
        sans: [
          '"Inter"',
          '"Noto Sans SC"',
          '"Microsoft YaHei"',
          'system-ui',
          'sans-serif'
        ],
        display: [
          '"Noto Serif SC"',
          '"Songti SC"',
          'Georgia',
          'serif'
        ]
      },
      boxShadow: {
        soft: '0 18px 50px -28px rgba(31, 41, 55, 0.28)',
        lift: '0 24px 60px -30px rgba(22, 58, 50, 0.38)'
      },
      transitionTimingFunction: {
        smooth: 'cubic-bezier(0.22, 1, 0.36, 1)'
      }
    }
  },
  plugins: []
}
