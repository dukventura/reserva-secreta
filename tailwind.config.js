/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        prime: {
          bg: '#08080a',
          surface: '#111116',
          card: '#16161d',
          cardHover: '#1e1e27',
          border: '#272733',
          gold: '#eab308',
          goldHover: '#ca8a04',
          goldLight: '#fde047',
          whatsapp: '#25D366',
          whatsappHover: '#1ea952',
        }
      },
      fontFamily: {
        sans: ['Inter', 'sans-serif'],
      },
    },
  },
  plugins: [],
}
