/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ["./src/**/*.{js,ts,jsx,tsx}", "./examples/**/*.{js,ts,jsx,tsx}"],
  theme: {
    extend: {
      colors: {
        // W-Ink brand colors
        wink: {
          50: "#f0f9ff",
          100: "#e0f2fe",
          200: "#bae6fd",
          300: "#7dd3fc",
          400: "#38bdf8",
          500: "#0ea5e9",
          600: "#0284c7",
          700: "#0369a1",
          800: "#075985",
          900: "#0c4a6e",
        },
        // Editor specific colors
        editor: {
          bg: "var(--editor-bg, #ffffff)",
          border: "var(--editor-border, #e5e7eb)",
          text: "var(--editor-text, #111827)",
          muted: "var(--editor-muted, #6b7280)",
          accent: "var(--editor-accent, #3b82f6)",
        },
        // Mention colors
        mention: {
          bg: "var(--mention-bg, #dbeafe)",
          text: "var(--mention-text, #1e40af)",
          border: "var(--mention-border, #93c5fd)",
        },
        // Hashtag colors
        hashtag: {
          bg: "var(--hashtag-bg, #f3e8ff)",
          text: "var(--hashtag-text, #7c3aed)",
          border: "var(--hashtag-border, #c4b5fd)",
        },
      },
      fontFamily: {
        sans: ["Inter", "system-ui", "sans-serif"],
        mono: ["JetBrains Mono", "Consolas", "monospace"],
      },
      spacing: {
        18: "4.5rem",
        88: "22rem",
      },
      borderRadius: {
        xl: "0.75rem",
        "2xl": "1rem",
        "3xl": "1.5rem",
      },
      boxShadow: {
        editor:
          "0 1px 3px 0 rgba(0, 0, 0, 0.1), 0 1px 2px 0 rgba(0, 0, 0, 0.06)",
        "editor-lg":
          "0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -2px rgba(0, 0, 0, 0.05)",
      },
      animation: {
        "fade-in": "fadeIn 0.2s ease-in-out",
        "slide-up": "slideUp 0.2s ease-out",
        "pulse-slow": "pulse 2s cubic-bezier(0.4, 0, 0.6, 1) infinite",
      },
      keyframes: {
        fadeIn: {
          "0%": { opacity: "0" },
          "100%": { opacity: "1" },
        },
        slideUp: {
          "0%": { transform: "translateY(10px)", opacity: "0" },
          "100%": { transform: "translateY(0)", opacity: "1" },
        },
      },
    },
  },
  plugins: [require("@tailwindcss/forms"), require("@tailwindcss/typography")],
  // Ensure TailwindCSS doesn't purge our component styles
  safelist: ["prose", "prose-sm", "prose-lg", "prose-xl", "prose-2xl"],
};
