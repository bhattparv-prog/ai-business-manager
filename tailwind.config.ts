import type { Config } from "tailwindcss";

export default {
  darkMode: "class",
  content: [
    "./src/pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        background: "var(--background)",
        foreground: "var(--foreground)",
        lark: {
          blue: "#3370FF",
          "blue-hover": "#2860E1",
          "blue-light": "#EBF1FF",
          dock: "#181B26",
          "dock-hover": "#242838",
          "dock-active": "#2E3447",
          canvas: "#F5F6F7",
          card: "#FFFFFF",
          border: "#DEE0E3",
          "border-subtle": "#EBEED2",
          title: "#1F2329",
          body: "#646A73",
          muted: "#8F959E",
          green: "#00B365",
          "green-light": "#E6F9F0",
          amber: "#FF7D00",
          "amber-light": "#FFF5EA",
          red: "#F54A45",
          "red-light": "#FFEAE8",
          purple: "#7B61FF",
          "purple-light": "#F3F0FF",
        },
      },
    },
  },
  plugins: [],
} satisfies Config;
