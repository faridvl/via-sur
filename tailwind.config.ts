import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
    "./lib/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        gray: {
          850: "#172033",
        },
        // Identidad TicoRed: azul océano (Pacífico Sur / Golfito) como
        // primario, coral cálido como acento de acción secundario.
        // Reservados para acciones de marca — no usar en estado/semántica.
        primary: {
          50: "#eef6ff",
          100: "#d9ebff",
          400: "#3b9eff",
          500: "#1279e6",
          600: "#0c63c2",
          700: "#0a4f9c",
          900: "#0d2748",
          950: "#0a1830",
        },
        accent: {
          400: "#ff9270",
          500: "#f97150",
          600: "#e2542f",
        },
        // Semántica de estado: separada del color de marca a propósito,
        // para que "éxito"/"alerta" nunca dependan del acento visual.
        success: {
          400: "#4ade80",
          500: "#22c55e",
          600: "#16a34a",
        },
        danger: {
          400: "#f87171",
          500: "#ef4444",
        },
        warning: {
          400: "#fbbf24",
          500: "#f59e0b",
        },
        // Colores puntuales solo para diferenciar íconos de categoría
        // (círculos del carrusel de categorías) — no son parte de la
        // paleta de acción/estado, únicamente decorativos ahí.
        violet: {
          400: "#a78bfa",
          500: "#8b5cf6",
        },
        pink: {
          400: "#f472b6",
          500: "#ec4899",
        },
      },
    },
  },
  plugins: [],
};

export default config;
