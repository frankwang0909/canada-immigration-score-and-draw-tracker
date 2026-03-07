/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  theme: {
    extend: {
      fontFamily: {
        sans: ['"Noto Sans SC"', '"PingFang SC"', '"Microsoft YaHei"', 'ui-sans-serif', 'system-ui']
      },
      boxShadow: {
        soft: '0 12px 40px -18px rgba(15, 23, 42, 0.35)'
      }
    }
  },
  plugins: []
};
