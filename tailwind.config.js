/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    './app/**/*.{js,jsx}',
    './components/**/*.{js,jsx}',
  ],
  theme: {
    extend: {
      colors: {
        leaf: {
          50: '#f2f9f1',
          100: '#e0f1de',
          200: '#c2e3bf',
          300: '#94ce92',
          400: '#61b160',
          500: '#3d9440',
          600: '#2c7731',
          700: '#255e2a',
          800: '#204b25',
          900: '#1b3e20',
        },
        earth: '#8a5a2b',
        cream: '#faf8f0',
      },
      fontFamily: {
        sans: ['Inter', 'system-ui', 'sans-serif'],
      },
    },
  },
  plugins: [],
};
