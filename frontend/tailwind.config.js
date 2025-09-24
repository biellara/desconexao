/** @type {import('tailwindcss').Config} */
export default {
  // A propriedade 'content' diz ao Tailwind para escanear
  // todos os arquivos HTML e JSX em busca de classes CSS.
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {},
  },
  plugins: [],
}

