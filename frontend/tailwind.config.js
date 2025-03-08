module.exports = {
    content: [
      "./index.html",
      "./src/**/*.{js,ts,jsx,tsx}",
    ],
    theme: {
      extend: {
        backgroundImage: {
          'grid-white': "linear-gradient(to right, rgba(255,255,255,0.1) 1px, transparent 1px), linear-gradient(to bottom, rgba(255,255,255,0.1) 1px, transparent 1px)"
        },
        boxShadow: {
          'neu': '0 8px 32px rgba(0,0,0,0.25)'
        }
      },
    },
    plugins: [
      require('@tailwindcss/typography'),
    ],
  }