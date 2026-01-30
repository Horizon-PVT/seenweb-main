/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./pages/**/*.{js,ts,jsx,tsx}",
    "./components/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      fontFamily: {
        sans: ['Montserrat', 'sans-serif'],
        serif: ['Playfair Display', 'serif'],
        bangers: ['Bangers', 'cursive'],
      },
      colors: {
        // Brand tokens (gold / red / white)
        brand: {
          gold: "#CDAD5A",
          gold2: "#F5C542",
          red: "#C1121F",
          red2: "#A50F19",
          ink: "#0A0F1E",
        },
      },
      boxShadow: {
        "brand-glow": "0 0 0 1px rgba(205,173,90,0.25), 0 20px 60px rgba(0,0,0,0.55)",
      },
      backgroundImage: {
        "brand-radial": "radial-gradient(1200px 600px at 20% 0%, rgba(205,173,90,0.18), transparent 60%)",
      },
    },
  },
  plugins: [],
};
