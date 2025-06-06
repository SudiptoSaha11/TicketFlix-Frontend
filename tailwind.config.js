/** @type {import('tailwindcss').Config} */
const colors = require('tailwindcss/colors');

module.exports = {
  content: [
    "./src/**/*.{js,jsx,ts,tsx}",
    "./public/index.html"
  ],
  theme: {
    extend: {
      colors: {
        // Custom gray:
        "custom-gray": "#222",

        // All Tailwind’s built-in palettes for convenience:
        slate: colors.slate,
        gray: colors.gray,
        zinc: colors.zinc,
        neutral: colors.neutral,
        stone: colors.stone,
        red: colors.red,
        orange: colors.orange,
        amber: colors.amber,
        yellow: colors.yellow,
        lime: colors.lime,
        green: colors.green,
        emerald: colors.emerald,
        teal: colors.teal,
        cyan: colors.cyan,
        sky: colors.sky,
        blue: colors.blue,
        indigo: colors.indigo,
        violet: colors.violet,
        purple: colors.purple,
        fuchsia: colors.fuchsia,
        pink: colors.pink,
        rose: colors.rose,

        // Additional standalone custom colors:
        "brand-primary": "#1E40AF",
        "brand-secondary": "#9333EA",
        "accent-light": "#FDE047",
        "accent-dark": "#B91C1C",
        "forest-green": "#2F855A",
        "sunset-orange": "#DD6B20",
        "ocean-blue": "#2C5282",
        "midnight": "#0F172A",
        "ivory": "#F9FAFB",
        "charcoal": "#334155",
      },
      keyframes: {
        fadeIn: {
          "0%": { opacity: "0", transform: "translateY(-2px)" },
          "100%": { opacity: "1", transform: "translateY(0)" },
        },
      },
      animation: {
        fadeIn: "fadeIn 0.3s ease-in-out",
      },
    },
  },
  plugins: [],
};
