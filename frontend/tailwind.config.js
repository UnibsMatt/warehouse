/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    './app/**/*.{js,ts,jsx,tsx,mdx}',
    './components/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      fontFamily: {
        sans: ['Inter', 'system-ui', 'sans-serif'],
      },
      colors: {
        brand: {
          cream: '#f6f7eb',
          red:   '#e94f37',
          dark:  '#393e41',
          blue:  '#3f88c5',
          teal:  '#44bba4',
        },
      },
    },
  },
  plugins: [],
}
