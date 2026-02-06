/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        // This was missing or not loaded
        primary: '#1e3a8a', 
      }
    },
  },
  plugins: [],
}