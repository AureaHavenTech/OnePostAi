import type { Config } from "tailwindcss";

const config: Config = {
  darkMode: "class",
  content: [
    "./src/pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        dark: "#12121a",
        gold: "#c9a96e",
        "gold-light": "#d4b87a",
        cream: "#e8e0d4",
        charcoal: "#2d2824",
        "warm-white": "#f5f0ea",
        gray: {
          50: '#f5f0ea',
          100: '#e8e0d4',
          200: '#d0c8bc',
          300: '#b0a89c',
          400: '#8a797d',
          500: '#6b5a5e',
          600: '#5a4a4e',
          700: '#44383c',
          800: '#2d2824',
          900: '#12121a',
          950: '#0a0a0f',
        },
      },
      fontFamily: {
        heading: ['Playfair Display', 'Georgia', 'serif'],
        body: ['Inter', '-apple-system', 'BlinkMacSystemFont', 'sans-serif'],
      },
      borderRadius: {
        lg: "1rem",
        xl: "1.5rem",
      },
      animation: {
        glow: "glow 2s ease-in-out infinite alternate",
      },
      keyframes: {
        glow: {
          "0%": { boxShadow: "0 0 20px rgba(201, 169, 110, 0.2)" },
          "100%": { boxShadow: "0 0 40px rgba(201, 169, 110, 0.35), 0 0 60px rgba(212, 184, 122, 0.15)" },
        },
      },
    },
  },
  plugins: [],
};
export default config;