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
      fontFamily: {
        sans: ["var(--font-geist-sans)", "sans-serif"],
        mono: ["var(--font-geist-mono)", "monospace"],
        poppins: ["var(--font-poppins)", "sans-serif"],
        pacifico: ["var(--font-pacifico)", "cursive"],
        fugaz: ["var(--font-fugaz)", "sans-serif"],
        alfa: ["var(--font-alfa)", "serif"],
      },
    },
  },
  plugins: [],
};
