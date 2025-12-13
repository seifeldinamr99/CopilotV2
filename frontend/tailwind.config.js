import animate from "tailwindcss-animate";

/** @type {import('tailwindcss').Config} */
export default {
  darkMode: ["class"],
  content: ["./index.html", "./src/**/*.{ts,tsx,js,jsx}"],
  theme: {
    container: {
      center: true,
      padding: "2rem",
      screens: {
        "2xl": "1400px",
      },
    },
    extend: {
      colors: {
        border: "hsl(215 19% 25%)",
        input: "hsl(217 27% 15%)",
        ring: "hsl(204 94% 60%)",
        background: "hsl(220 39% 6%)",
        foreground: "hsl(0 0% 100%)",
        card: {
          DEFAULT: "hsl(222 41% 11%)",
          foreground: "hsl(0 0% 100%)",
        },
        muted: {
          DEFAULT: "hsl(220 24% 14%)",
          foreground: "hsl(218 11% 70%)",
        },
        accent: {
          DEFAULT: "hsl(203 100% 65%)",
          foreground: "hsl(215 33% 9%)",
        },
        success: "hsl(194 95% 65%)",
        warning: "hsl(33 97% 63%)",
        destructive: {
          DEFAULT: "hsl(347 77% 50%)",
          foreground: "hsl(0 0% 100%)",
        },
        sidebar: "hsl(224 38% 8%)",
      },
      borderRadius: {
        xl: "1.25rem",
      },
      fontFamily: {
        sans: ["'Inter'", "system-ui", "sans-serif"],
      },
      boxShadow: {
        glow: "0 0 30px rgba(64, 171, 255, 0.35)",
      },
      backgroundImage: {
        "card-gradient":
          "linear-gradient(145deg, rgba(0, 82, 212, 0.4), rgba(0, 164, 255, 0.15))",
      },
    },
  },
  plugins: [animate],
};
