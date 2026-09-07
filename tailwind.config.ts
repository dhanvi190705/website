import type { Config } from "tailwindcss";

const config: Config = {
  darkMode: "class",
  content: ["./src/**/*.{js,ts,jsx,tsx,mdx}"],
  theme: {
    extend: {
      colors: {
        gold: {
          DEFAULT: "#FFD400",
          50: "#FFFDF0",
          100: "#FFF9CC",
          200: "#FFF08A",
          300: "#FFE44D",
          400: "#FFDA1A",
          500: "#FFD400",
          600: "#E6BF00",
          700: "#B39400",
          800: "#806A00",
          900: "#4D4000",
        },
        surface: {
          DEFAULT: "#0B0C0F",
          50: "#F5F5F6",
          100: "#1C1E24",
          200: "#181A1F",
          300: "#141519",
          400: "#101114",
          500: "#0B0C0F",
          600: "#08090B",
          border: "#26282F",
        },
      },
      fontFamily: {
        sans: [
          "Inter",
          "ui-sans-serif",
          "system-ui",
          "-apple-system",
          "sans-serif",
        ],
      },
      boxShadow: {
        gold: "0 0 0 1px rgba(255,212,0,0.35), 0 8px 24px -8px rgba(255,212,0,0.3)",
      },
      animation: {
        "fade-in": "fadeIn 0.2s ease-out",
        "slide-up": "slideUp 0.25s ease-out both",
        float: "float 5s ease-in-out infinite",
        "gradient-shift": "gradientShift 6s ease infinite",
      },
      keyframes: {
        fadeIn: {
          "0%": { opacity: "0" },
          "100%": { opacity: "1" },
        },
        float: {
          "0%, 100%": { transform: "translateY(0)" },
          "50%": { transform: "translateY(-8px)" },
        },
        gradientShift: {
          "0%, 100%": { backgroundPosition: "0% 50%" },
          "50%": { backgroundPosition: "100% 50%" },
        },
        slideUp: {
          "0%": { opacity: "0", transform: "translateY(8px)" },
          "100%": { opacity: "1", transform: "translateY(0)" },
        },
      },
    },
  },
  plugins: [],
};

export default config;
