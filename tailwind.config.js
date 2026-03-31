/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,jsx,ts,tsx}'],
  theme: {
    extend: {
      colors: {
        ink: '#0a0b14',
        panel: '#111827',
        accent: '#7c3aed',
        mint: '#2dd4bf',
        rose: '#fb7185',
      },
      boxShadow: {
        glow: '0 0 0 1px rgba(255,255,255,0.05), 0 20px 45px rgba(15,23,42,0.35)',
      },
      backgroundImage: {
        aurora:
          'radial-gradient(circle at top left, rgba(45,212,191,0.15), transparent 30%), radial-gradient(circle at top right, rgba(96,165,250,0.18), transparent 35%), linear-gradient(135deg, #050816 0%, #0b1023 40%, #131935 100%)',
      },
      fontFamily: {
        sans: ['"Plus Jakarta Sans"', 'system-ui', 'sans-serif'],
      },
    },
  },
  plugins: [],
};
