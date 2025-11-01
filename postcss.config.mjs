/** @type {import('postcss-load-config').Config} */
const config = {
  plugins: {
    tailwindcss: {}, // <-- Đảm bảo là 'tailwindcss: {}'
    autoprefixer: {},
  },
}

export default config;