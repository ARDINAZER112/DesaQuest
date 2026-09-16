/** @type {import('tailwindcss').Config} */
export default {
  content: ["./index.html", "./src/**/*.{js,jsx}"],
  theme: {
    extend: {
      colors: {
        brand: {
          green: "#2E7D32",
          greendark: "#245F27",
          greenlight: "#66BB6A",
          yellow: "#FFC107",
          blue: "#1565C0",
        },
      },
    },
  },
  plugins: [],
};
