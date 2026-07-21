import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./app/**/*.{ts,tsx}",
    "./components/**/*.{ts,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        // Hex kvůli opacity modifikátorům (text-paper/60 apod.);
        // stejné hodnoty drží CSS proměnné v globals.css pro čisté CSS.
        ink: "#14181A",
        paper: "#FAF9F6",
        stone: "#EDEAE3",
        bronze: "#A9885A",
        "bronze-deep": "#8A6D43",
        muted: "#6E6A63",
        line: "rgba(20, 24, 26, 0.12)",
      },
      fontFamily: {
        sans: ["var(--font-hanken)", "system-ui", "sans-serif"],
      },
      transitionTimingFunction: {
        luxe: "cubic-bezier(0.22, 1, 0.36, 1)",
      },
      maxWidth: {
        site: "1360px",
      },
    },
  },
  plugins: [],
};

export default config;
