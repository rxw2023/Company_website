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
      fontFamily: {
        display: ['"Cormorant Garamond"', 'Georgia', 'serif'],
        body: ['"Inter"', '-apple-system', 'BlinkMacSystemFont', 'sans-serif'],
        mono: ['"JetBrains Mono"', 'monospace'],
      },
      colors: {
        warm: {
          canvas:    '#faf9f5',
          primary:   '#cc785c',
          'primary-active': '#a9583e',
          ink:       '#141413',
          body:      '#3d3d3a',
          muted:     '#6c6a64',
          hairline:  '#e6dfd8',
          surface:   '#efe9de',
          'surface-dark': '#181715',
          'on-dark':        '#faf9f5',
          'on-dark-soft':   '#a09d96',
          'card-hover':     '#f4efe6',
        },
      },
      borderRadius: {
        'btn': '8px',
        'card': '12px',
      },
    },
  },
  plugins: [],
};
