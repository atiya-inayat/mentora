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
        background: "#F7F9FA",
        surface: "#E9EDF0",
        primary: "#0D7377",
        primaryHover: "#0A5D61",
        text: "#1F2937",
        success: "#16A34A",
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
