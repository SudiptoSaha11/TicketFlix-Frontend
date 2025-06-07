/** @type {import('tailwindcss').Config} */
const colors = require('tailwindcss/colors');

module.exports = {
  content: [
    "./src/**/*.{js,jsx,ts,tsx}",
    "./public/index.html"
  ],
  theme: {
    extend: {
      // ✅ Custom breakpoints
      screens: {
        antarikh: '1680px',
      },

      colors: {
        "custom-gray": "#222",

        // Tailwind palettes
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

        // Custom colors
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
  scroll: {
    "0%": { transform: "translateX(0%)" },
    "100%": { transform: "translateX(-200%)" },
  },
  scroll160: {
    "0%": { transform: "translateX(0%)" },
    "100%": { transform: "translateX(-160%)" },
  },
  scroll130: {
    "0%": { transform: "translateX(0%)" },
    "100%": { transform: "translateX(-168%)" },
  },
},
animation: {
  fadeIn: "fadeIn 0.3s ease-in-out",
  'scroll-slow': 'scroll 50s linear infinite',
  'scroll-medium': 'scroll130 50s linear infinite',
  'scroll-fast': 'scroll 20s linear infinite',
  'scroll-md': 'scroll160 25s linear infinite'
},
    },
  },
  plugins: [],
};
