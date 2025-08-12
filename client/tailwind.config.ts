import type { Config } from "tailwindcss"

export default {
  darkMode: ["class"],
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
    "./node_modules/@llamaindex/chat-ui/dist/**/*.{js,ts,jsx,tsx}",
  ],
  // Note: Removed safelist as Tailwind v4's content detection is smart enough to find
  // the accent-* classes in our CSS file and the ring-* classes in AccentColorPicker.tsx
  // The static object in AccentColorPicker ensures these classes are always included.
  theme: {
    extend: {
      colors: {
        // Core theme colors
        bg: "var(--bg)",
        "bg-alt": "var(--bg-alt)",
        text: "var(--text)",
        "text-muted": "var(--text-muted)",
        border: "var(--border)",
        "code-bg": "var(--code-bg)",
        "code-border": "var(--code-border)",
        
        // Accent colors
        accent: "var(--accent)",
        "accent-contrast": "var(--accent-contrast)",
        "accent-soft": "var(--accent-soft)",
        "accent-muted": "var(--accent-muted)",
        
        // Error colors
        error: "var(--error)",
        "error-contrast": "var(--error-contrast)",
        "error-bg": "var(--error-bg)",
        "error-border": "var(--error-border)",
        
        // Legacy shadcn colors (for compatibility)
        background: "var(--bg)",
        foreground: "var(--text)",
        input: "var(--border)",
        ring: "var(--accent)",
        primary: {
          DEFAULT: "var(--accent)",
          foreground: "var(--accent-contrast)",
        },
        secondary: {
          DEFAULT: "var(--bg-alt)",
          foreground: "var(--text)",
        },
        destructive: {
          DEFAULT: "var(--error)",
          foreground: "var(--error-contrast)",
        },
        muted: {
          DEFAULT: "var(--bg-alt)",
          foreground: "var(--text-muted)",
        },
        popover: {
          DEFAULT: "var(--bg)",
          foreground: "var(--text)",
        },
        card: {
          DEFAULT: "var(--bg-alt)",
          foreground: "var(--text)",
        },
      },
      borderRadius: {
        lg: "var(--radius)",
        md: "calc(var(--radius) - 2px)",
        sm: "calc(var(--radius) - 4px)",
      },
      maxWidth: {
        bubble: "72%",
      },
      keyframes: {
        "fade-in": {
          from: { opacity: "0" },
          to: { opacity: "1" },
        },
        "fade-up": {
          from: { 
            opacity: "0",
            transform: "translateY(10px)",
          },
          to: { 
            opacity: "1",
            transform: "translateY(0)",
          },
        },
        "slide-in-left": {
          from: { 
            opacity: "0",
            transform: "translateX(-10px)",
          },
          to: { 
            opacity: "1",
            transform: "translateX(0)",
          },
        },
        "slide-in-right": {
          from: { 
            opacity: "0",
            transform: "translateX(10px)",
          },
          to: { 
            opacity: "1",
            transform: "translateX(0)",
          },
        },
        "scale-in": {
          from: { 
            opacity: "0",
            transform: "scale(0.95)",
          },
          to: { 
            opacity: "1",
            transform: "scale(1)",
          },
        },
        "pulse-soft": {
          "0%, 100%": { opacity: "1" },
          "50%": { opacity: "0.5" },
        },
      },
      animation: {
        "fade-in": "fade-in 0.3s ease-out",
        "fade-up": "fade-up 0.3s ease-out",
        "slide-in-left": "slide-in-left 0.3s ease-out",
        "slide-in-right": "slide-in-right 0.3s ease-out",
        "scale-in": "scale-in 0.2s ease-out",
        "pulse-soft": "pulse-soft 2s ease-in-out infinite",
      },
    },
  },
  plugins: [],
} satisfies Config