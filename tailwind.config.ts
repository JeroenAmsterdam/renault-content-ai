import type { Config } from 'tailwindcss'

const config: Config = {
  content: [
    './pages/**/*.{js,ts,jsx,tsx,mdx}',
    './components/**/*.{js,ts,jsx,tsx,mdx}',
    './app/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      colors: {
        primary: {
          DEFAULT: '#0000FF',
          dark: '#0000CC',
          light: '#3333FF',
        },
        accent: {
          DEFAULT: '#E3021B',
          dark: '#B30116',
          light: '#FF1A33',
        },
        secondary: {
          DEFAULT: '#000000',
          light: '#333333',
        }
      },
    },
  },
  plugins: [],
}
export default config
