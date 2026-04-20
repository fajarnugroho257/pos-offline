/** @type {import('tailwindcss').Config} */
export default {
  content: ["./index.html", "./src/**/*.{js,jsx,ts,tsx}"],
  theme: {
    extend: {
      fontFamily: {
        opensans: ["Open Sans", "sans-serif"],
        poppins: ["Poppins", "sans-serif"],
      },
      colors: {
        transparent: "transparent",
        current: "currentColor",
        colorPrimary: "#006A67",
        colorPrimaryHover: "#029C97FF",
        colorGray: "#F5F5F5",
        colorRed: "#C30222",
      },
    },
  },
  plugins: [],
};
