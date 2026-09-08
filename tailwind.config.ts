import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        ink: "#172033",
        mist: "#f4f7fb",
        coral: "#ef6b5d",
      },
      boxShadow: {
        panel: "0 14px 40px rgba(23, 32, 51, 0.08)",
      },
    },
  },
  plugins: [],
};

export default config;
