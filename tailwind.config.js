/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        dk: {
          red: '#ef394e',
          'red-hover': '#d32f2f',
          'red-light': '#fff0f2',
          dark: '#242424',
          text: '#3f4064',
          muted: '#81858b',
          border: '#e0e0e2',
          gray: '#f8f8f9',
          green: '#00a049',
          'green-light': '#e8f7ee',
          blue: '#19bfd3',
          amber: '#f9a825',
        }
      },
      fontFamily: {
        sans: ['Vazirmatn', 'Tahoma', 'sans-serif'],
      }
    },
  },
  plugins: [],
}
