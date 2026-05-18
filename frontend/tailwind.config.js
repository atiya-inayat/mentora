/** @type {import('tailwindcss').Config} */
module.exports = {
  darkMode: ["class"],
  content: [
    "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        background: "#D2DCB6",
        surface: "#A1BC98",
        primary: "#778873",
      },

      fontFamily: {
        sans: ["var(--font-geist-sans)", "sans-serif"],
        mono: ["var(--font-geist-mono)", "monospace"],
        poppins: ["var(--font-poppins)", "sans-serif"],
        pacifico: ["var(--font-pacifico)", "cursive"],
        fugaz: ["var(--font-fugaz)", "sans-serif"],
        alfa: ["var(--font-alfa)", "serif"],
      },
      animation: {
        marquee: "marquee 25s linear infinite",
      },

      keyframes: {
        marquee: {
          "0%": {
            transform: "translateX(100%)",
          },
          "100%": {
            transform: "translateX(-100%)",
          },
        },
      },
    },
  },
  plugins: [],
};
