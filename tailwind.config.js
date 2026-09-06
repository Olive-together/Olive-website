/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  theme: {
    extend: {
      colors: {
        olive: {
          50:  '#f4f7ee',
          100: '#e6efd5',
          200: '#cde0ae',
          300: '#abca7c',
          400: '#8bb451',
          500: '#6f9a35',
          600: '#567a27',
          700: '#435e21',
          800: '#394e1f',
          900: '#31421d',
          950: '#18230c',
        },
        cream: '#faf8f3',
        sage:  '#a8c07a',
      },
      fontFamily: {
        poppins: ['Poppins', 'sans-serif'],
        inter:   ['Inter', 'sans-serif'],
      },
      borderRadius: {
        '4xl': '2rem',
        '5xl': '2.5rem',
      },
      boxShadow: {
        card:   '0 4px 24px rgba(70,100,40,0.10)',
        'card-hover': '0 8px 40px rgba(70,100,40,0.18)',
        btn:    '0 4px 16px rgba(70,100,40,0.22)',
      },
      animation: {
        'fade-in':   'fadeIn 0.4s ease-out',
        'slide-up':  'slideUp 0.4s ease-out',
        'scale-in':  'scaleIn 0.3s ease-out',
        'float':     'float 3s ease-in-out infinite',
        'pulse-soft':'pulseSoft 2s ease-in-out infinite',
      },
      keyframes: {
        fadeIn:   { from: { opacity: '0' }, to: { opacity: '1' } },
        slideUp:  { from: { opacity: '0', transform: 'translateY(20px)' }, to: { opacity: '1', transform: 'translateY(0)' } },
        scaleIn:  { from: { opacity: '0', transform: 'scale(0.95)' }, to: { opacity: '1', transform: 'scale(1)' } },
        float:    { '0%,100%': { transform: 'translateY(0)' }, '50%': { transform: 'translateY(-8px)' } },
        pulseSoft:{ '0%,100%': { opacity: '1' }, '50%': { opacity: '0.7' } },
      },
    },
  },
  plugins: [],
};
