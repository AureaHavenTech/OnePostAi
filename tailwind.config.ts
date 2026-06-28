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
        cream: "#faf7f2",
        gold: { DEFAULT: "#c9a84c", light: "#e8c97a" },
        rose: "#d4a0a0",
        blush: "#e8c4c4",
        charcoal: "#2d2824",
        dark: "#1a1614",
        "warm-white": "#f5f0ea",
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
        gray: {
          50: '#faf7f2',
          100: '#f5f0ea',
          200: '#e0d5d8',
          300: '#c4b5b8',
          400: '#8a797d',
          500: '#6b5a5e',
          600: '#5a4a4e',
          700: '#44383c',
          800: '#2a2426',
          900: '#1c1c1e',
          950: '#12100e',
        },
      },
      borderRadius: {
        lg: "var(--radius)",
        md: "calc(var(--radius) - 2px)",
        sm: "calc(var(--radius) - 4px)",
      },
      animation: {
        glow: "glow 2s ease-in-out infinite alternate",
        "fade-in": "fadeIn 0.5s ease-out",
        "slide-up": "slideUp 0.6s ease-out",
      },
      keyframes: {
        glow: {
          "0%": { boxShadow: "0 0 20px rgba(201, 168, 76, 0.2)" },
          "100%": { boxShadow: "0 0 40px rgba(201, 168, 76, 0.35), 0 0 60px rgba(212, 160, 160, 0.15)" },
        },
        fadeIn: {
          "0%": { opacity: "0", transform: "translateY(10px)" },
          "100%": { opacity: "1", transform: "translateY(0)" },
        },
        slideUp: {
          "0%": { opacity: "0", transform: "translateY(30px)" },
          "100%": { opacity: "1", transform: "translateY(0)" },
        },
      },
    },
  },
  plugins: [],
};
export default config;