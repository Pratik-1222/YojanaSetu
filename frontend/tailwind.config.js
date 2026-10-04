/** @type {import('tailwindcss').Config} */
export default {
  content: ["./index.html", "./src/**/*.{js,jsx}"],
  theme: {
    extend: {
      colors: {
        primary: "#0B2545",       // Deep Ashoka Navy
        primaryDark: "#081B33",   // Midnight Blue
        primaryTint: "#EEF4F8",   // Soft Slate/Ice Tint
        secondary: "#FF9933",     // Warm Indian Saffron Gold
        secondaryDark: "#E67E00", // Deep Saffron
        secondaryTint: "#FFF4E6", // Soft Saffron Glow
        accent: "#059669",        // Emerald Green (Tricolor Accent)
        accentDark: "#047857",    // Deep Emerald
        accentTint: "#D1FAE5",    // Soft Emerald Glow
        bg: "#F8FAFC",            // Canvas Background
        success: "#059669",
        warning: "#D97706",
        danger: "#DC2626",
        ink: "#0F172A",           // Deep Slate Ink
        sub: "#475569",           // Muted Sub-text
        line: "#E2E8F0",          // Subtle Border
      },
      fontFamily: {
        sans: ["'Plus Jakarta Sans'", "Inter", "system-ui", "sans-serif"],
      },
      fontSize: {
        "2xs": ["0.65rem", { lineHeight: "1rem" }],
      },
      maxWidth: {
        "8xl": "88rem",
      },
      spacing: {
        "4.5": "1.125rem",
        "5.5": "1.375rem",
        "8.5": "2.125rem",
        "13": "3.25rem",
        "15": "3.75rem",
        "18": "4.5rem",
      },
      boxShadow: {
        glass: "0 8px 32px 0 rgba(11, 37, 69, 0.08)",
        glow: "0 0 25px -5px rgba(255, 153, 51, 0.35)",
        glowNavy: "0 0 30px -5px rgba(11, 37, 69, 0.25)",
        cardHover: "0 20px 40px -15px rgba(15, 23, 42, 0.1)",
        "2xs": "0 1px 2px 0 rgba(0,0,0,0.05)",
        elevated: "0 4px 16px -4px rgba(11, 37, 69, 0.12), 0 1px 4px -1px rgba(11, 37, 69, 0.06)",
        "card-premium": "0 0 0 1px rgba(226,232,240,0.8), 0 4px 24px -6px rgba(15,23,42,0.07)",
        "inner-sm": "inset 0 1px 2px rgba(0,0,0,0.05)",
      },
      borderRadius: {
        "4xl": "2rem",
        "5xl": "2.5rem",
      },
      animation: {
        'pulse-slow': 'pulse 3s cubic-bezier(0.4, 0, 0.6, 1) infinite',
        'float': 'float 4s ease-in-out infinite',
        'shimmer': 'shimmer 2.5s linear infinite',
        'slide-up': 'slideUp 0.4s cubic-bezier(0.16, 1, 0.3, 1) forwards',
        'fade-in': 'fadeIn 0.3s ease-out forwards',
        'scale-in': 'scaleIn 0.25s cubic-bezier(0.16, 1, 0.3, 1) forwards',
      },
      keyframes: {
        float: {
          '0%, 100%': { transform: 'translateY(0px)' },
          '50%': { transform: 'translateY(-8px)' },
        },
        shimmer: {
          '0%': { backgroundPosition: '-200% 0' },
          '100%': { backgroundPosition: '200% 0' },
        },
        slideUp: {
          '0%': { opacity: '0', transform: 'translateY(12px)' },
          '100%': { opacity: '1', transform: 'translateY(0)' },
        },
        fadeIn: {
          '0%': { opacity: '0' },
          '100%': { opacity: '1' },
        },
        scaleIn: {
          '0%': { opacity: '0', transform: 'scale(0.94)' },
          '100%': { opacity: '1', transform: 'scale(1)' },
        },
      },
      transitionTimingFunction: {
        'spring': 'cubic-bezier(0.16, 1, 0.3, 1)',
      },
    },
  },
  plugins: [],
};
