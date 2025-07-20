/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./src/**/*.{js,jsx,ts,tsx}",
    "./node_modules/flowbite/**/*.js",
  ],
  theme: {
    extend: {
      colors: {
        green1: '#EDF4F2', 
        olive1: '#7C8363',      
        darkgreen1: '#31473A',  
      },
      keyframes: {
      loopScroll: {
      '0%': { transform: 'translateY(0%)' },
      '100%': { transform: 'translateY(-50%)' },
      },
      loopScrollReverse: {
        '0%': { transform: 'translateY(-50%)' },
        '100%': { transform: 'translateY(0%)' },
        },
      },
      animation: {
        loopScroll: 'loopScroll 10s linear infinite',
        loopScrollReverse: 'loopScrollReverse 10s linear infinite',      },
    },
  },
  plugins: [
    require('flowbite/plugin'),
  ],
}