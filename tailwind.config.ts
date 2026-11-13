import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./src/pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        paper: "#EDE5D3",
        "paper-deep": "#E2D8C1",
        "paper-card": "#F4EFE2",
        ink: "#0E0D0B",
        "ink-muted": "#4A463F",
        "ink-faint": "#8C8578",
        vermilion: "#E8502A",
        "vermilion-dark": "#C93D1B",
      },
      fontFamily: {
        display: ["var(--font-display)", "sans-serif"],
        sans: ["var(--font-sans)", "sans-serif"],
        mono: ["var(--font-mono)", "monospace"],
      },
      letterSpacing: {
        tightest: "-0.04em",
      },
    },
  },
  plugins: [],
};
export default config;

