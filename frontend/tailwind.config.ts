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
          gold: '#8A6345',
          darkGold: '#6F4C34',
          navy: '#34291F',
          ivory: '#F8F5EF',
          cream: '#F1E9DE',
          card: '#FFFDF9',
          white: '#FFFFFF',
          text: '#3E3731',
          border: '#DED3C5',
          sage: '#9DA294',
          rose: '#B98578',
          ink: '#211A15',
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
        luxury: '0 24px 70px rgba(52, 41, 31, 0.12)',
        card: '0 18px 45px rgba(52, 41, 31, 0.08)',
        glow: '0 0 34px rgba(138, 99, 69, 0.18)',
        'gold-soft': '0 12px 34px rgba(138, 99, 69, 0.18)',
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
