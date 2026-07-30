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
          gold: '#C39B56',
          darkGold: '#A67A32',
          navy: '#08172F',
          ivory: '#FAF7F1',
          cream: '#F7F0E6',
          card: '#FFFDF8',
          white: '#FFFFFF',
          text: '#38342F',
          border: '#DDCEB8',
          sage: '#A9B79D',
          rose: '#D594A0',
          ink: '#121B2C',
        },
      },
      fontFamily: {
        display: ['"Cormorant Garamond"', 'Cinzel', '"Playfair Display"', 'Georgia', 'serif'],
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
