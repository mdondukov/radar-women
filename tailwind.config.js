/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ["./src/**/*.{html,js,tsx}"],
  theme: {
    extend: {
      colors: {
        // Brand palette for "Женщины Ферганы": headings/buttons/interactive
        // states stay close to the project logo's green+blue, while Jamilya's
        // illustration supplies playful accents — the red skirt as a small
        // pop (active step, radio buttons) and a soft lilac tint of her robe
        // as the page background. Overrides the default Tailwind
        // `lime`/`blue`/`amber` scales so every existing lime-*/blue-*/amber-*
        // utility class picks up the new colors without touching each
        // component.
        lime: {
          50: "#EAF7EF",
          100: "#CFEBDA",
          200: "#A3D9BB",
          300: "#74C495",
          400: "#3EA96D",
          500: "#1B8A4E",
          600: "#0F7440",
          700: "#0B6B32",
          800: "#095127",
          900: "#063A1B",
        },
        blue: {
          50: "#E7F1FA",
          100: "#C7E1F3",
          200: "#96C6E8",
          300: "#63A9DB",
          400: "#337FC0",
          500: "#0060A8",
          600: "#00548F",
          700: "#004D87",
          800: "#003D6C",
          900: "#002C4E",
        },
        amber: {
          300: "#D21030",
        },
      },
    },
  },
  plugins: [],
}
