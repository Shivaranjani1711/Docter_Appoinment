/** @type {import('tailwindcss').Config} */
export default {
  content: ["./index.html", "./src/**/*.{ts,tsx}"],
  theme: {
    extend: {
      colors: {
        // Restrained clinical palette - one accent, neutral base. No purple/gradient system.
        brand: {
          50: "#eef6f4",
          100: "#d7ece6",
          200: "#aed9cd",
          300: "#7fc2b0",
          400: "#4fa791",
          500: "#2f8975",
          600: "#226e5d",
          700: "#1c594b",
          800: "#19473e",
          900: "#163b34",
        },
        ink: {
          50: "#f7f8f8",
          100: "#eceeef",
          200: "#d7dade",
          300: "#b3b9c0",
          400: "#878f99",
          500: "#656e7a",
          600: "#4c5560",
          700: "#3a414b",
          800: "#282d34",
          900: "#181c21",
        },
        danger: { 50: "#fdf2f2", 500: "#c0392b", 600: "#a4291d" },
        warning: { 50: "#fef9ec", 500: "#b7791f", 600: "#92600f" },
        success: { 50: "#eef9f1", 500: "#217a4c", 600: "#1a6240" },
      },
      borderRadius: {
        sm: "4px",
        DEFAULT: "6px",
        md: "8px",
        lg: "10px",
        xl: "14px",
      },
      fontFamily: {
        sans: ["Inter", "system-ui", "-apple-system", "Segoe UI", "Roboto", "sans-serif"],
      },
    },
  },
  plugins: [],
};
