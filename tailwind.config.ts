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
        pink: {
          50: '#fdf2f4',
          100: '#fce7eb',
          200: '#f9d0d8',
          300: '#f4a9b8',
          400: '#ec7890',
          500: '#d44a6a',
          600: '#c23a5a',
          700: '#a22d4a',
          800: '#872740',
          900: '#72243a',
        },
        gold: {
          400: '#facc15',
          500: '#eab308',
          600: '#ca8a04',
        },
        gray: {
          50: '#fcf9f5',
          100: '#f5f0f1',
          200: '#e0d5d8',
          300: '#c4b5b8',
          400: '#8a797d',
          500: '#6b5a5e',
          600: '#5a4a4e',
          700: '#44383c',
          800: '#2a2426',
          900: '#1c1c1e',
          950: '#141416',
        },
      },
      borderRadius: {
        lg: "var(--radius)",
        md: "calc(var(--radius) - 2px)",
        sm: "calc(var(--radius) - 4px)",
      },
      animation: {
        "glow": "glow 2s ease-in-out infinite alternate",
      },
      keyframes: {
        glow: {
          "0%": { boxShadow: "0 0 20px rgba(212, 74, 106, 0.25)" },
          "100%": { boxShadow: "0 0 40px rgba(212, 74, 106, 0.4), 0 0 60px rgba(234, 179, 8, 0.15)" },
        },
      },
    },
  },
  plugins: [],
};
export default config;