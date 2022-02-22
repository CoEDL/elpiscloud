module.exports = {
  content: ['./src/**/*.{js,ts,jsx,tsx}'],
  theme: {
    extend: {
      colors: {
        accent: '#9333ea',
        primary: '#662D91',
        secondary: '#262262',
      },
    },
  },
  // eslint-disable-next-line node/no-unpublished-require
  plugins: [require('@tailwindcss/typography'), require('@tailwindcss/forms')],
};
