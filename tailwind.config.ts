import type { Config } from 'tailwindcss';

const config: Config = {
  content: [
    './app/**/*.{js,ts,jsx,tsx,mdx}',
    './components/**/*.{js,ts,jsx,tsx,mdx}',
    './lib/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      colors: {
        cream: {
          50: '#FFFBF5',
          100: '#FFF6E8',
          200: '#FFEAD1',
          300: '#FFDBB3',
          400: '#FFC78A',
        },
        ink: {
          DEFAULT: '#1F1A17',
          muted: '#4A423E',
          light: '#736A64',
        },
        tomato: {
          DEFAULT: '#FF4D00',
          dark: '#CC3D00',
          light: '#FF7A40',
        },
        lagoon: {
          DEFAULT: '#0D9488',
          dark: '#0B766C',
          light: '#14B8A6',
        },
      },
      fontFamily: {
        display: ['var(--font-space-grotesk)', 'sans-serif'],
        body: ['var(--font-inter)', 'system-ui', 'sans-serif'],
      },
      boxShadow: {
        poster: '4px 4px 0px 0px rgba(31,26,23,1)',
        'poster-hover': '6px 6px 0px 0px rgba(255,77,0,1)',
      },
      borderWidth: {
        3: '3px',
      },
      animation: {
        'fade-in': 'fadeIn 0.35s ease-out',
        'slide-up': 'slideUp 0.4s cubic-bezier(0.16, 1, 0.3, 1)',
      },
      keyframes: {
        fadeIn: {
          from: { opacity: '0' },
          to: { opacity: '1' },
        },
        slideUp: {
          from: { opacity: '0', transform: 'translateY(12px)' },
          to: { opacity: '1', transform: 'translateY(0)' },
        },
      },
    },
  },
  plugins: [],
};
export default config;
