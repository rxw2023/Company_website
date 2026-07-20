/** WARNING: DON'T EDIT THIS FILE */
/** WARNING: DON'T EDIT THIS FILE */
/** WARNING: DON'T EDIT THIS FILE */

/** @type {import('tailwindcss').Config} */

export default {
  darkMode: "class",
  content: ["./index.html", "./src/**/*.{js,ts,jsx,tsx}"],
  theme: {
    container: {
      center: true,
    },
    extend: {
      colors: {
        apple: {
          blue: '#0066cc',
          'blue-hover': '#0071e3',
          ink: '#1d1d1f',
          parchment: '#f5f5f7',
          pearl: '#fafafc',
          muted: '#333333',
          dim: '#7a7a7a',
          hairline: '#e0e0e0',
          'tile-dark-1': '#272729',
          'tile-dark-2': '#2a2a2c',
        },
      },
    },
  },
  plugins: [],
};
