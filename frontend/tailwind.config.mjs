/** @type {import('tailwindcss').Config} */
const config = {
  content: [
    "./src/pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        navy: {
          950: "#090D16",
          900: "#0F172A",
          800: "#1E293B",
          700: "#334155",
          600: "#475569",
        },
        burgundy: {
          950: "#4C0519",
          900: "#881337",
          800: "#9F1239",
          700: "#BE123C",
          600: "#E11D48",
        },
        surface: {
          50: "#FAFAF9",
          100: "#F5F5F4",
          200: "#E7E5E4",
        },
        risk: {
          low: "#10B981",      // Green (0-25)
          medium: "#F59E0B",   // Amber (26-50)
          high: "#F43F5E",     // Rose/Coral (51-75)
          severe: "#881337",   // Deep Burgundy (76-100)
        }
      },
      borderRadius: {
        'card': '18px',
        'card-lg': '24px',
      },
      fontFamily: {
        sans: ['Inter', 'system-ui', 'sans-serif'],
      },
      boxShadow: {
        'card-soft': '0 4px 20px -2px rgba(15, 23, 42, 0.06), 0 2px 6px -1px rgba(15, 23, 42, 0.04)',
        'card-hover': '0 12px 30px -4px rgba(15, 23, 42, 0.12), 0 4px 12px -2px rgba(15, 23, 42, 0.08)',
        'glow-burgundy': '0 0 25px -5px rgba(136, 19, 55, 0.3)',
      }
    },
  },
  plugins: [],
};

export default config;
