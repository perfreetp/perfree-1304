/** @type {import('tailwindcss').Config} */

export default {
  darkMode: "class",
  content: ["./index.html", "./src/**/*.{js,ts,jsx,tsx}"],
  theme: {
    extend: {
      colors: {
        navy: {
          50: "#E6ECF5",
          100: "#C3D0E4",
          200: "#98AED0",
          300: "#6C8CBC",
          400: "#4B71AE",
          500: "#2A57A1",
          600: "#20457E",
          700: "#18345E",
          800: "#0F2747",
          900: "#081728",
          950: "#050F1C",
        },
        brand: {
          blue: "#2563EB",
          amber: "#F59E0B",
          emerald: "#10B981",
          rose: "#EF4444",
          sky: "#38BDF8",
        },
      },
      fontFamily: {
        display: ['"Space Grotesk"', "system-ui", "sans-serif"],
        sans: ['"Noto Sans SC"', "system-ui", "sans-serif"],
      },
      boxShadow: {
        card: "0 1px 3px rgba(15, 39, 71, 0.06), 0 1px 2px rgba(15, 39, 71, 0.04)",
        "card-hover":
          "0 10px 20px -6px rgba(15, 39, 71, 0.15), 0 4px 8px -4px rgba(15, 39, 71, 0.08)",
        glow: {
          free: "0 0 0 1px rgba(16, 185, 129, 0.4), 0 0 12px rgba(16, 185, 129, 0.25)",
          occupied: "0 0 0 1px rgba(37, 99, 235, 0.4), 0 0 12px rgba(37, 99, 235, 0.25)",
          fault: "0 0 0 1px rgba(239, 68, 68, 0.4), 0 0 12px rgba(239, 68, 68, 0.25)",
          warning: "0 0 0 1px rgba(245, 158, 11, 0.4), 0 0 12px rgba(245, 158, 11, 0.25)",
        },
      },
      keyframes: {
        "fade-in": {
          "0%": { opacity: "0", transform: "translateY(8px)" },
          "100%": { opacity: "1", transform: "translateY(0)" },
        },
        "slide-in-right": {
          "0%": { transform: "translateX(100%)" },
          "100%": { transform: "translateX(0)" },
        },
        pulseSoft: {
          "0%, 100%": { opacity: "1" },
          "50%": { opacity: "0.6" },
        },
      },
      animation: {
        "fade-in": "fade-in 0.3s ease-out",
        "slide-in-right": "slide-in-right 0.3s ease-out",
        "pulse-soft": "pulseSoft 2s ease-in-out infinite",
      },
    },
  },
  plugins: [],
};
