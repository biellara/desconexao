/** @type {import('tailwindcss').Config} */
export default {
  darkMode: 'class',
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        primary: {
          DEFAULT: 'hsl(240, 80%, 60%)',
          light: 'hsl(240, 80%, 95%)',
          dark: 'hsl(240, 80%, 50%)',
        },
        secondary: {
          DEFAULT: 'hsl(210, 10%, 45%)',
          light: 'hsl(210, 15%, 96%)',
          dark: 'hsl(210, 10%, 20%)',
        },
        alert: {
          DEFAULT: 'hsl(0, 75%, 60%)',
          light: 'hsl(0, 75%, 95%)',
          dark: 'hsl(0, 75%, 50%)',
        },
        background: 'var(--background)',
        foreground: 'var(--foreground)',
        card: 'var(--card)',
        'card-foreground': 'var(--card-foreground)',
      }
    },
  },
  plugins: [],
}

