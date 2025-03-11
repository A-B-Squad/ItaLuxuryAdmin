import type { Config } from "tailwindcss";

const config = {
  darkMode: ["class"],
  content: [
    "./src/**/*.{ts,tsx}",
    "./pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
    "./**/@material-tailwind/**/*.{html,js,ts,jsx,tsx,mdx}",
  ],
  prefix: "",
  theme: {
    container: {
      center: true,
      padding: "2rem",
      screens: {
        "2xl": "1400px",
      },
    },
    extend: {
      colors: {
        // Primary brand colors
        mainColorAdminDash: "#1E293B", // Slate 800 - Main brand color (dark blue)

        // Dashboard color system
        dashboard: {
          primary: {
            DEFAULT: "#3B82F6", // Blue 500
            light: "#93C5FD",   // Blue 300
            dark: "#1D4ED8",    // Blue 700
          },
          secondary: {
            DEFAULT: "#6366F1", // Indigo 500
            light: "#A5B4FC",   // Indigo 300
            dark: "#4338CA",    // Indigo 700
          },
          success: {
            DEFAULT: "#10B981", // Emerald 500
            light: "#6EE7B7",   // Emerald 300
            dark: "#047857",    // Emerald 700
          },
          warning: {
            DEFAULT: "#F59E0B", // Amber 500
            light: "#FCD34D",   // Amber 300
            dark: "#B45309",    // Amber 700
          },
          danger: {
            DEFAULT: "#EF4444", // Red 500
            light: "#FCA5A5",   // Red 300
            dark: "#B91C1C",    // Red 700
          },
          info: {
            DEFAULT: "#06B6D4", // Cyan 500
            light: "#67E8F9",   // Cyan 300
            dark: "#0E7490",    // Cyan 700
          },
          neutral: {
            50: "#F8FAFC",      // Slate 50
            100: "#F1F5F9",     // Slate 100
            200: "#E2E8F0",     // Slate 200
            300: "#CBD5E1",     // Slate 300
            400: "#94A3B8",     // Slate 400
            500: "#64748B",     // Slate 500
            600: "#475569",     // Slate 600
            700: "#334155",     // Slate 700
            800: "#1E293B",     // Slate 800
            900: "#0F172A",     // Slate 900
          },
        },

        // Original colors
        lightBeige: "#F0EDD4",
        mediumBeige: "#ECCDB4",
        strongBeige: "#f17e7e",
        lightBlack: "#00000030",
        border: "hsl(var(--border))",
        input: "hsl(var(--input))",
        ring: "hsl(var(--ring))",
        background: "hsl(var(--background))",
        foreground: "hsl(var(--foreground))",
        primary: {
          DEFAULT: "hsl(var(--primary))",
          foreground: "hsl(var(--primary-foreground))",
        },
        secondary: {
          DEFAULT: "hsl(var(--secondary))",
          foreground: "hsl(var(--secondary-foreground))",
        },
        destructive: {
          DEFAULT: "hsl(var(--destructive))",
          foreground: "hsl(var(--destructive-foreground))",
        },
        muted: {
          DEFAULT: "hsl(var(--muted))",
          foreground: "hsl(var(--muted-foreground))",
        },
        accent: {
          DEFAULT: "hsl(var(--accent))",
          foreground: "hsl(var(--accent-foreground))",
        },
        popover: {
          DEFAULT: "hsl(var(--popover))",
          foreground: "hsl(var(--popover-foreground))",
        },
        card: {
          DEFAULT: "hsl(var(--card))",
          foreground: "hsl(var(--card-foreground))",
        },
      },
      borderRadius: {
        lg: "var(--radius)",
        md: "calc(var(--radius) - 2px)",
        sm: "calc(var(--radius) - 4px)",
      },
      keyframes: {
        "accordion-down": {
          from: { height: "0" },
          to: { height: "var(--radix-accordion-content-height)" },
        },
        "accordion-up": {
          from: { height: "var(--radix-accordion-content-height)" },
          to: { height: "0" },
        },
      },
      animation: {
        "accordion-down": "accordion-down 0.2s ease-out",
        "accordion-up": "accordion-up 0.2s ease-out",
      },
    },
  },
  plugins: [require("tailwindcss-animate")],
} satisfies Config;

export default config;
