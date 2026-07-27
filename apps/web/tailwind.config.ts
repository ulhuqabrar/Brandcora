import type { Config } from "tailwindcss";
import tailwindAnimate from "tailwindcss-animate";

const config = {
  darkMode: ["class"],
  content: [
    "./app/**/*.{ts,tsx}",
    "./src/**/*.{ts,tsx}",
  ],
  theme: {
    container: {
      center: true,
      padding: "2rem",
      screens: {
        "2xl": "1440px",
      },
    },
    extend: {
      colors: {
        border: "hsl(var(--border))",
        "border-strong": "hsl(var(--border-strong))",
        input: "hsl(var(--input))",
        ring: "hsl(var(--ring))",
        background: {
          DEFAULT: "hsl(var(--background))",
          warm: "hsl(var(--background-warm))",
          soft: "hsl(var(--background-soft))",
        },
        surface: {
          DEFAULT: "hsl(var(--surface))",
          warm: "hsl(var(--surface-warm))",
          elevated: "hsl(var(--surface-elevated))",
        },
        foreground: {
          DEFAULT: "hsl(var(--foreground))",
          secondary: "hsl(var(--foreground-secondary))",
          muted: "hsl(var(--foreground-muted))",
          subtle: "hsl(var(--foreground-subtle))",
        },
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
        "dark-surface": "hsl(var(--dark-surface))",
        "dark-surface-elevated": "hsl(var(--dark-surface-elevated))",
        brand: {
          orange: "var(--brand-orange)",
          peach: "var(--brand-peach)",
          gold: "var(--brand-gold)",
        },
        lavender: {
          DEFAULT: "var(--lavender)",
          soft: "var(--lavender-soft)",
          muted: "var(--lavender-muted)",
        },
        warm: {
          offwhite: "var(--warm-offwhite)",
          cream: "var(--warm-cream)",
        },
        graphite: {
          DEFAULT: "var(--graphite)",
          elevated: "var(--graphite-elevated)",
          light: "var(--graphite-light)",
        },
      },
      fontFamily: {
        sans: ['Manrope', 'system-ui', '-apple-system', 'sans-serif'],
        mono: ['IBM Plex Mono', 'monospace'],
        serif: ['Georgia', 'Cambria', '"Times New Roman"', 'serif'],
      },
      borderRadius: {
        lg: "var(--radius)",
        md: "calc(var(--radius) - 2px)",
        sm: "calc(var(--radius) - 4px)",
        '2xl': '1.5rem',
        '3xl': '2rem',
        '4xl': '2.5rem',
      },
      spacing: {
        '18': '4.5rem',
        '22': '5.5rem',
        '26': '6.5rem',
        '30': '7.5rem',
        '34': '8.5rem',
        '38': '9.5rem',
        '128': '32rem',
        '144': '36rem',
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
      fontSize: {
        'display': ['clamp(3rem, 7vw, 7rem)', { lineHeight: '0.92', letterSpacing: '-0.03em', fontWeight: '700' }],
        'display-lg': ['clamp(3.5rem, 8vw, 8rem)', { lineHeight: '0.9', letterSpacing: '-0.03em', fontWeight: '800' }],
        'editorial': ['clamp(2.5rem, 5vw, 4.5rem)', { lineHeight: '1.05', letterSpacing: '-0.02em', fontWeight: '700' }],
        'section': ['clamp(2rem, 4vw, 3.5rem)', { lineHeight: '1.1', letterSpacing: '-0.02em', fontWeight: '700' }],
      },
    },
  },
  plugins: [tailwindAnimate],
} satisfies Config;

export default config;
