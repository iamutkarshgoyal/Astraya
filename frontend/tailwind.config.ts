import type { Config } from 'tailwindcss';
import tailwindcssAnimate from 'tailwindcss-animate';

const config: Config = {
  darkMode: ['class'],
  content: ['./index.html', './src/**/*.{ts,tsx}'],
  theme: {
    container: {
      center: true,
      padding: {
        DEFAULT: '1rem',
        sm: '1.5rem',
        lg: '2rem',
        xl: '2.5rem',
      },
      screens: {
        '2xl': '1200px',
      },
    },
    extend: {
      colors: {
        astraya: {
          gold: '#D4B06A',
          darkGold: '#B88A2A',
          navy: '#0D2147',
          ivory: '#FAF6EF',
          cream: '#F7F2E9',
          card: '#FFFDF9',
          white: '#FFFFFF',
          text: '#3E3E3E',
          border: '#E7DCC7',
          sage: '#6F7F6E',
          rose: '#B68477',
          ink: '#172033',
        },
      },
      fontFamily: {
        display: ['Cinzel', '"Playfair Display"', '"Cormorant Garamond"', 'Georgia', 'serif'],
        serif: ['Lora', '"Libre Baskerville"', '"Cormorant Garamond"', 'Georgia', 'serif'],
        body: ['Lora', '"Libre Baskerville"', 'Georgia', 'serif'],
        button: ['Poppins', 'ui-sans-serif', 'system-ui', 'sans-serif'],
        sans: ['Lora', '"Libre Baskerville"', 'Georgia', 'serif'],
      },
      boxShadow: {
        luxury: '0 24px 70px rgba(13, 33, 71, 0.12)',
        card: '0 18px 45px rgba(13, 33, 71, 0.08)',
        glow: '0 0 34px rgba(212, 176, 106, 0.24)',
        'gold-soft': '0 12px 34px rgba(184, 138, 42, 0.22)',
      },
      borderRadius: {
        sm: '4px',
        md: '6px',
        lg: '8px',
      },
    },
  },
  plugins: [tailwindcssAnimate],
};

export default config;
