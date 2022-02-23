module.exports = {
  content: [
    "./src/**/*.{js,jsx,ts,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        'silverfox': '#dfeaf7',
        'whiteish': '#f4f8fc',
        'persimmon': '#FB6B47',
      }
    },
  },
  plugins: [
    require('autoprefixer')
  ],
}