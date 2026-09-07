import type { Config } from "tailwindcss";

const config: Config = {
  darkMode: "class",
  content: ["./src/**/*.{js,ts,jsx,tsx,mdx}"],
  theme: {
    extend: {
      colors: {
        gold: {
          DEFAULT: "#D4AF37",
          50: "#FBF6E7",
          100: "#F6ECC9",
          200: "#EEDA97",
          300: "#E5C765",
          400: "#DDBB4E",
          500: "#D4AF37",
          600: "#B3922B",
          700: "#8A7122",
          800: "#61501A",
          900: "#382E0F",
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
        gold: "0 0 0 1px rgba(212,175,55,0.35), 0 8px 24px -8px rgba(212,175,55,0.25)",
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
