import type { Config } from "tailwindcss";

const config: Config = {
  darkMode: "class",
  content: [
    "./pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      fontFamily: {
        sans: ["Montserrat", "sans-serif"],
      },
      colors: {
        // ARTDENT brand palette
        brand: {
          blue:       "#397B9C",
          "blue-mid": "#2F6782",
          "blue-dark":"#274F65",
          green:      "#5AAD9C",
          "green-mid":"#4E9587",
          mint:       "#ACD6CE",
          teal:       "#49949C",
        },
        // CSS variable bridge for shadcn
        background: "hsl(var(--background))",
        foreground: "hsl(var(--foreground))",
        card:       { DEFAULT: "hsl(var(--card))", foreground: "hsl(var(--card-foreground))" },
        popover:    { DEFAULT: "hsl(var(--popover))", foreground: "hsl(var(--popover-foreground))" },
        primary:    { DEFAULT: "hsl(var(--primary))", foreground: "hsl(var(--primary-foreground))" },
        secondary:  { DEFAULT: "hsl(var(--secondary))", foreground: "hsl(var(--secondary-foreground))" },
        muted:      { DEFAULT: "hsl(var(--muted))", foreground: "hsl(var(--muted-foreground))" },
        accent:     { DEFAULT: "hsl(var(--accent))", foreground: "hsl(var(--accent-foreground))" },
        destructive:{ DEFAULT: "hsl(var(--destructive))", foreground: "hsl(var(--destructive-foreground))" },
        border:     "hsl(var(--border))",
        input:      "hsl(var(--input))",
        ring:       "hsl(var(--ring))",
        sidebar: {
          DEFAULT:           "hsl(var(--sidebar-background))",
          foreground:        "hsl(var(--sidebar-foreground))",
          primary:           "hsl(var(--sidebar-primary))",
          "primary-foreground":"hsl(var(--sidebar-primary-foreground))",
          accent:            "hsl(var(--sidebar-accent))",
          "accent-foreground":"hsl(var(--sidebar-accent-foreground))",
          border:            "hsl(var(--sidebar-border))",
          ring:              "hsl(var(--sidebar-ring))",
        },
      },
      borderRadius: {
        lg: "var(--radius)",
        md: "calc(var(--radius) - 2px)",
        sm: "calc(var(--radius) - 4px)",
      },
      keyframes: {
        "fade-in": {
          "0%":   { opacity: "0", transform: "translateY(8px)" },
          "100%": { opacity: "1", transform: "translateY(0)" },
        },
        "slide-in": {
          "0%":   { transform: "translateX(-100%)" },
          "100%": { transform: "translateX(0)" },
        },
        pulse: {
          "0%, 100%": { opacity: "1" },
          "50%":      { opacity: "0.5" },
        },
      },
      animation: {
        "fade-in":  "fade-in 0.3s ease forwards",
        "slide-in": "slide-in 0.3s ease forwards",
        pulse:      "pulse 2s infinite",
      },
    },
  },
  plugins: [],
};

export default config;
