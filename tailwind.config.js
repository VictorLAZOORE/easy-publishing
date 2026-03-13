/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    './app/**/*.{js,ts,jsx,tsx,mdx}',
    './components/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      fontFamily: {
        sans: ['var(--font-sans)', 'system-ui', 'sans-serif'],
      },
      colors: {
        brand: {
          50: '#fef7ee',
          100: '#fdedd6',
          200: '#f9d7ac',
          300: '#f4ba77',
          400: '#ee9240',
          500: '#ea751a',
          600: '#db5b10',
          700: '#b54410',
          800: '#903715',
          900: '#742f14',
          950: '#3e1507',
        },
      },
    },
  },
  plugins: [],
}

