import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./src/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        'pookie-green': '#2d5016',
        'pookie-light-green': '#6b8e4f',
        'pookie-yellow': '#ffd700',
        'pookie-cream': '#fffef0',
      },
      fontFamily: {
        'mono': ['Courier New', 'monospace'],
      },
    },
  },
  plugins: [],
};
export default config;

