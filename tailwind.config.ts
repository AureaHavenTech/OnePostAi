import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./src/pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        slate: {
          50: '#f8f6f3',
          100: '#e8e3da',
          200: '#d4cdc0',
          300: '#b8ad9a',
          400: '#a09080',
          500: '#8a7a68',
          600: '#6e6052',
          700: '#544840',
          800: '#3a322e',
          900: '#12121a',
          950: '#0a0a0f',
        },
        brand: {
          50: '#faf8f5',
          100: '#f5efe6',
          200: '#ebe0cc',
          300: '#dcc8a8',
          400: '#d4b87a',
          500: '#c9a96e',
          600: '#a88640',
          700: '#8a6b36',
          800: '#6e552b',
          900: '#584422',
          950: '#3d2e17',
        },
        accent: {
          50: '#faf8f5',
          100: '#f5efe6',
          200: '#ebe0cc',
          300: '#dcc8a8',
          400: '#d4b87a',
          500: '#c9a96e',
          600: '#a88640',
          700: '#8a6b36',
          800: '#6e552b',
          900: '#584422',
          950: '#3d2e17',
        },
      },
      fontFamily: {
        serif: ['Playfair Display', 'Georgia', 'serif'],
        sans: ['Inter', 'system-ui', 'sans-serif'],
      },
      backgroundImage: {
        "gradient-radial": "radial-gradient(var(--tw-gradient-stops))",
        "gradient-conic": "conic-gradient(from 180deg at 50% 50%, var(--tw-gradient-stops))",
      },
    },
  },
  plugins: [],
};
export default config;