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
        // Map standard Tailwind colors to our luxury palette
        indigo: {
          50: '#fefce8',
          100: '#fef9c3',
          200: '#fef08a',
          300: '#fde047',
          400: '#facc15',
          500: '#eab308',
          600: '#ca8a04',
          700: '#a16207',
          800: '#854d0e',
          900: '#713f12',
        },
        purple: {
          50: '#fdf2f8',
          100: '#fce7f3',
          200: '#fbcfe8',
          300: '#f9a8d4',
          400: '#f472b6',
          500: '#ec4899',
          600: '#db2777',
          700: '#be185d',
          800: '#9d174d',
          900: '#831843',
        },
        zinc: {
          50: '#fcf9f2',
          100: '#f5efe6',
          200: '#e8dfd2',
          300: '#d4c5b0',
          400: '#c4b5a0',
          500: '#8a7f72',
          600: '#6b6358',
          700: '#4d4740',
          800: '#3d3832',
          900: '#2d2a24',
          950: '#1a1815',
        },
        cream: {
          50: '#fefcf5',
          100: '#fdf8e8',
          200: '#fbf0cc',
          300: '#f7e3a0',
          400: '#f2d16a',
          500: '#ecbc3a',
        },
        gold: {
          50: '#fefbe8',
          100: '#fef7c3',
          200: '#feee8a',
          300: '#fddf47',
          400: '#facc15',
          500: '#eab308',
          600: '#ca8a04',
        },
        blush: {
          50: '#fdf2f8',
          100: '#fce7f3',
          200: '#fbcfe8',
          300: '#f9a8d4',
          400: '#f472b6',
          500: '#ec4899',
          600: '#db2777',
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
          "0%": { boxShadow: "0 0 20px rgba(234, 179, 8, 0.3)" },
          "100%": { boxShadow: "0 0 40px rgba(234, 179, 8, 0.5), 0 0 60px rgba(244, 114, 182, 0.2)" },
        },
      },
    },
  },
  plugins: [],
};
export default config;