import type { Config } from 'tailwindcss'

const config: Config = {
  content: [
    './pages/**/*.{js,ts,jsx,tsx,mdx}',
    './components/**/*.{js,ts,jsx,tsx,mdx}', // Dòng này quan trọng nhất
  ],
  theme: {
    extend: {},
  },
  plugins: [],
}
export default config