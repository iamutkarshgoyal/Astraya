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
          gold: '#C89B3C',
          navy: '#0B214A',
          ivory: '#FAF7F2',
          white: '#FFFFFF',
          text: '#202020',
          sage: '#657C6A',
          rose: '#B98272',
          ink: '#101827',
        },
      },
      fontFamily: {
        display: ['"Playfair Display"', '"Cormorant Garamond"', 'Georgia', 'serif'],
        serif: ['"Cormorant Garamond"', 'Georgia', 'serif'],
        sans: ['Inter', 'Poppins', 'ui-sans-serif', 'system-ui', 'sans-serif'],
      },
      boxShadow: {
        luxury: '0 24px 80px rgba(11, 33, 74, 0.12)',
        glow: '0 0 36px rgba(200, 155, 60, 0.2)',
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
