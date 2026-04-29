/** @type {import('tailwindcss').Config} */
export default {
  content: ["./index.html", "./src/**/*.{js,jsx,ts,tsx}"],
  theme: {
    extend: {
      fontFamily: {
        sans: ["Outfit", "Inter", "sans-serif"],
        arabic: ["Cairo", "sans-serif"],
        display: ["Playfair Display", "serif"],
      },
      colors: {
        primary: {
          50: "#f6f6f9",
          100: "#ececf1",
          200: "#d5d5e0",
          300: "#afb0c4",
          400: "#8385a1",
          500: "#606385",
          600: "#4b4e6b",
          700: "#3d4057",
          800: "#343649",
          900: "#2e2f3e",
          950: "#1a1a24",
        },
        neutral: {
          50: "#fafafa",
          100: "#f4f4f5",
          200: "#e4e4e7",
          300: "#d4d4d8",
          400: "#a1a1aa",
          500: "#71717a",
          600: "#52525b",
          700: "#3f3f46",
          800: "#27272a",
          900: "#18181b",
          950: "#09090b",
        },
        accent: {
          500: "#3b82f6", // vibrant blue for some micro-interactions
          600: "#2563eb",
        }
      },
      boxShadow: {
        'soft': '0 4px 20px -2px rgba(0, 0, 0, 0.05)',
        'glass': '0 8px 32px 0 rgba(0, 0, 0, 0.03)',
        'glow': '0 0 20px rgba(59, 130, 246, 0.5)',
      },
      animation: {
        "fade-in": "fadeIn 0.5s ease-in-out",
        "slide-up": "slideUp 0.6s cubic-bezier(0.16, 1, 0.3, 1)",
        "shimmer": "shimmer 1.5s infinite",
        "float": "float 6s ease-in-out infinite",
        "pulse-slow": "pulse 4s cubic-bezier(0.4, 0, 0.6, 1) infinite",
      },
      keyframes: {
        fadeIn: { "0%": { opacity: 0 }, "100%": { opacity: 1 } },
        slideUp: {
          "0%": { transform: "translateY(20px)", opacity: 0 },
          "100%": { transform: "translateY(0)", opacity: 1 },
        },
        shimmer: {
          "0%": { backgroundPosition: "-200% 0" },
          "100%": { backgroundPosition: "200% 0" },
        },
        float: {
          "0%, 100%": { transform: "translateY(0)" },
          "50%": { transform: "translateY(-10px)" },
        }
      },
    },
  },
  plugins: [],
};
