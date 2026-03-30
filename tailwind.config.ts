import type { Config } from "tailwindcss";

const config: Config = {
  content: ["./app/**/*.{ts,tsx}", "./src/**/*.{ts,tsx}"],
  theme: {
    extend: {
      colors: {
        paper: "var(--color-paper)",
        ink: "var(--color-ink)",
        accent: "var(--color-accent)"
      },
      boxShadow: {
        glow: "0 24px 80px rgba(37, 29, 20, 0.18)"
      }
    }
  },
  plugins: []
};

export default config;
