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
        // 引用 src/index.css 里的 CSS 自定义属性，不再重复写死色值。
        // 改品牌色只需改 index.css 一处。
        // 注意：这样写之后 `bg-warm-primary/50` 这类透明度修饰符不再可用
        // （Tailwind 需要原始通道值才能算 alpha）；需要时请用 var() 或 color-mix。
        warm: {
          canvas:           'var(--warm-canvas)',
          primary:          'var(--warm-primary)',
          'primary-active': 'var(--warm-primary-active)',
          ink:              'var(--warm-ink)',
          body:             'var(--warm-body)',
          muted:            'var(--warm-muted)',
          hairline:         'var(--warm-hairline)',
          surface:          'var(--warm-surface)',
          'surface-dark':   'var(--warm-surface-dark)',
          'on-dark':        'var(--warm-on-dark)',
          'on-dark-soft':   'var(--warm-on-dark-soft)',
          'card-hover':     'var(--warm-card-hover)',
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
