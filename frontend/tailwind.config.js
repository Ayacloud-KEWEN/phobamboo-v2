/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{vue,js}'],
  theme: {
    extend: {
      colors: {
        // Bamboo palette (preserved from the original site). Tweak these per
        // restaurant — combined with CSS vars in theme.css for full reskin.
        bamboo: {
          primary: '#2d5a27',
          secondary: '#4a7c59',
          light: '#8a9a5b',
          accent: '#c9d4a2',
        },
      },
      fontFamily: {
        sans: ['Inter', 'system-ui', 'sans-serif'],
      },
    },
  },
  plugins: [],
};
