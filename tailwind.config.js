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
        grain: '#f5b921',
      },
      fontFamily: {
        sans: ['Inter', 'system-ui', 'sans-serif'],
      },
      transitionTimingFunction: {
        'out-expo': 'cubic-bezier(.16, 1, .3, 1)',
      },
      keyframes: {
        'fade-in': {
          '0%': { opacity: '0' },
          '100%': { opacity: '1' },
        },
        'fade-up': {
          '0%': { opacity: '0', transform: 'translateY(16px)' },
          '100%': { opacity: '1', transform: 'none' },
        },
        'scale-in': {
          '0%': { opacity: '0', transform: 'scale(.96)' },
          '100%': { opacity: '1', transform: 'none' },
        },
        'menu-in': {
          '0%': { opacity: '0', transform: 'translateY(-8px)' },
          '100%': { opacity: '1', transform: 'none' },
        },
        // Transform only, no opacity: fading a page in from 0 delays Largest
        // Contentful Paint by the full duration. A transform does not.
        'page-enter': {
          '0%': { transform: 'translate3d(0, 10px, 0)' },
          '100%': { transform: 'none' },
        },

        // Brand mark parts — each animates independently so the sprout "grows"
        'ground-in': {
          '0%': { opacity: '0', transform: 'scaleX(.5)' },
          '100%': { opacity: '1', transform: 'scaleX(1)' },
        },
        'stem-grow': {
          '0%': { strokeDashoffset: '1' },
          '100%': { strokeDashoffset: '0' },
        },
        'leaf-unfurl': {
          '0%': { opacity: '0', transform: 'scale(.3) rotate(-12deg)' },
          '100%': { opacity: '1', transform: 'none' },
        },
        'seed-pop': {
          '0%': { opacity: '0', transform: 'scale(0)' },
          '65%': { opacity: '1', transform: 'scale(1.18)' },
          '100%': { opacity: '1', transform: 'scale(1)' },
        },
        breathe: {
          '0%, 100%': { transform: 'translateY(0)' },
          '50%': { transform: 'translateY(-3px)' },
        },

        // Loading indicators
        shimmer: {
          '100%': { transform: 'translateX(100%)' },
        },
        // Holds until the grow sequence finishes (last seed lands at 1560ms),
        // then fades. `visibility` flips only at 100%, so the overlay stops
        // intercepting clicks the moment it is no longer visible.
        'splash-out': {
          '0%, 78%': { opacity: '1', visibility: 'visible' },
          '100%': { opacity: '0', visibility: 'hidden' },
        },
        // Trickles toward — but never reaches — 100%: the bar only completes
        // when the destination actually renders.
        'route-bar': {
          '0%': { transform: 'scaleX(.02)' },
          '25%': { transform: 'scaleX(.38)' },
          '55%': { transform: 'scaleX(.64)' },
          '80%': { transform: 'scaleX(.82)' },
          '100%': { transform: 'scaleX(.92)' },
        },
      },
      animation: {
        'fade-in': 'fade-in .4s cubic-bezier(.16,1,.3,1) both',
        'fade-up': 'fade-up .5s cubic-bezier(.16,1,.3,1) both',
        'scale-in': 'scale-in .45s cubic-bezier(.16,1,.3,1) both',
        'menu-in': 'menu-in .22s cubic-bezier(.16,1,.3,1) both',
        'page-enter': 'page-enter .28s cubic-bezier(.05,.7,.1,1) both',
        'ground-in': 'ground-in .5s cubic-bezier(.16,1,.3,1) both',
        'stem-grow': 'stem-grow .7s cubic-bezier(.16,1,.3,1) both',
        'leaf-unfurl': 'leaf-unfurl .55s cubic-bezier(.16,1,.3,1) both',
        'seed-pop': 'seed-pop .4s cubic-bezier(.16,1,.3,1) both',
        breathe: 'breathe 2.4s ease-in-out infinite',
        shimmer: 'shimmer 1.6s infinite',
        'splash-out': 'splash-out 2.1s cubic-bezier(.16,1,.3,1) forwards',
        'route-bar': 'route-bar 2.4s cubic-bezier(0,.6,.3,1) forwards',
      },
    },
  },
  plugins: [],
};
