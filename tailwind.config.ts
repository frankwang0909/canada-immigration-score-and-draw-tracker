import type { Config } from 'tailwindcss';

const config: Config = {
  content: ['./src/**/*.{ts,tsx}'],
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

export default config;
