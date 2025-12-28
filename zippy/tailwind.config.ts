import type { Config } from "tailwindcss";

export default {
  content: [
    "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/hooks/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/lib/**/*.{js,ts,jsx,tsx,mdx}",
    "./public/fonts/fonts.ts",
  ],
  theme: {
    extend: {
      colors: {
        background: "var(--background)",
        foreground: "var(--foreground)",
      },
      fontFamily: {
        spoqaHanSansNeo: ["var(--font-spoqaHanSansNeo)", "sans-serif"],
        firaCode: ["var(--font-fira-code)", "monospace"],
      },
      height: {
        screen: "calc(var(--vh, 1vh) * 100)",
      },
      minHeight: {
        screen: "calc(var(--vh, 1vh) * 100)",
      },
      maxHeight: {
        screen: "calc(var(--vh, 1vh) * 100)",
      },
    },
  },
  plugins: [],
} satisfies Config;
