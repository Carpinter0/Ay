import type { Config } from 'tailwindcss';

export default {
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  theme: {
    extend: {
      colors: {
        'rose-deep': '#9B2335',
        'rose-medium': '#C85A71',
        'rose-soft': '#F2A7B8',
        cream: '#FDF6EC',
        champagne: '#F5E6D3',
        mahogany: '#4A1728',
        gold: '#C9A84C',
      },
      fontFamily: {
        display: ['"Cormorant Garamond"', 'Georgia', 'serif'],
        body: ['"Work Sans"', 'system-ui', 'sans-serif'],
      },
    },
  },
  plugins: [],
} satisfies Config;
