/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ["./src/**/*.{js,jsx,ts,tsx}"],
  theme: {
    extend: {
      fontFamily: {
        sans: ['Urbanist', 'sans-serif'],
      },
      transitionProperty: {
        'border-radius': 'border-radius',
        'clip-path': 'clip-path',
      },
    },
  },
  corePlugins: {
    preflight: false,
  },
};
