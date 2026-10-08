import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      spacing: {
        "4.5": "1.125rem",
        "5.5": "1.375rem",
        "6.5": "1.625rem",
        "8.5": "2.125rem",
        "9.5": "2.375rem",
      },
      scale: {
        "98": "0.98",
      },
      boxShadow: {
        "2xs": "0 1px 2px 0 rgba(0, 0, 0, 0.05)",
        xs: "0 1px 2px 0 rgba(0, 0, 0, 0.05)",
      },
      colors: {
        brand: {
          navy: "#031033",
          primary: "#1787D4",
          yellow: "#FFC75D",
        },
      },
    },
  },
  plugins: [],
};

export default config;
