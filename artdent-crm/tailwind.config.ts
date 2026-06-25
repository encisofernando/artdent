import type { Config } from "tailwindcss"

export default {
  content: [
    "./resources/**/*.blade.php",
    "./resources/**/*.tsx",
    "./resources/**/*.ts",
  ],
  theme: {
    extend: {
      colors: {
        artdent: {
          blue: "#397B9C",
          green: "#5AAD9C",
          mint: "#ACD6CE",
          teal: "#49949C",
          navy: "#124C69",
          steel: "#7CA5C3",
          pale: "#DAE6F0",
          mintpale: "#DAEEE3",
          bg: "#DAE6F0",
          surface: "#EAF3F9",
          border: "#A8C8DC",
        },
      },
      fontFamily: {
        sans: ["Montserrat", "ui-sans-serif", "system-ui", "sans-serif"],
      },
    },
  },
  plugins: [],
} satisfies Config
