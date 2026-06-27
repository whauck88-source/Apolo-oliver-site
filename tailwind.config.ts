import type { Config } from 'tailwindcss';
const config: Config = {
  content: ['./src/**/*.{js,ts,jsx,tsx,mdx}'],
  theme: {
    extend: {
      colors: {
        blood: '#B81D24',
        'blood-dark': '#8B1419',
        'blood-light': '#E02530',
        midnight: '#0A0A0F',
        'midnight-blue': '#0D1117',
        cream: '#F5F0EB',
        'cream-dim': '#B8B0A8',
      },
      fontFamily: {
        display: ['Oswald', 'Impact', 'Arial Narrow', 'sans-serif'],
        body: ['Inter', 'system-ui', 'sans-serif'],
      },
    },
  },
  plugins: [],
};
export default config;
