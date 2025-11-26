import type { Config } from "tailwindcss";

const config: Config = {
    darkMode: ["class"],
    content: [
        "./pages/**/*.{js,ts,jsx,tsx,mdx}",
        "./components/**/*.{js,ts,jsx,tsx,mdx}",
        "./app/**/*.{js,ts,jsx,tsx,mdx}",
    ],
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
                border: "hsl(var(--border))",
                input: "hsl(var(--input))",
                ring: "hsl(var(--ring))",
                background: "hsl(var(--background))",
                foreground: "hsl(var(--foreground))",
                primary: {
                    DEFAULT: "hsl(var(--primary))",
                    foreground: "hsl(var(--primary-foreground))",
                    from: "rgb(var(--primary-from))",
                    to: "rgb(var(--primary-to))",
                },
                secondary: {
                    DEFAULT: "hsl(var(--secondary))",
                    foreground: "hsl(var(--secondary-foreground))",
                },
                destructive: {
                    DEFAULT: "hsl(var(--destructive))",
                    foreground: "hsl(var(--destructive-foreground))",
                },
                success: {
                    DEFAULT: "hsl(var(--success))",
                    foreground: "hsl(var(--success-foreground))",
                },
                warning: {
                    DEFAULT: "hsl(var(--warning))",
                    foreground: "hsl(var(--warning-foreground))",
                },
                info: {
                    DEFAULT: "hsl(var(--info))",
                    foreground: "hsl(var(--info-foreground))",
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
            fontFamily: {
                sans: ['Inter', 'system-ui', 'sans-serif'],
                mono: ['JetBrains Mono', 'monospace'],
            },
            boxShadow: {
                'glow': '0 0 20px hsl(var(--primary) / 0.3)',
                'glow-lg': '0 0 40px hsl(var(--primary) / 0.5)',
                'glass': '0 8px 32px 0 rgba(31, 38, 135, 0.15)',
                'elevated': '0 10px 40px -10px rgba(0, 0, 0, 0.1)',
            },
            backdropBlur: {
                xs: '2px',
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
                "shimmer": {
                    "0%": { backgroundPosition: "-1000px 0" },
                    "100%": { backgroundPosition: "1000px 0" },
                },
                "float": {
                    "0%, 100%": { transform: "translateY(0px)" },
                    "50%": { transform: "translateY(-10px)" },
                },
                "pulse-glow": {
                    "0%, 100%": { boxShadow: "0 0 20px hsl(var(--primary) / 0.3)" },
                    "50%": { boxShadow: "0 0 40px hsl(var(--primary) / 0.6)" },
                },
                "slide-in-right": {
                    from: { transform: "translateX(100%)", opacity: "0" },
                    to: { transform: "translateX(0)", opacity: "1" },
                },
                "slide-in-left": {
                    from: { transform: "translateX(-100%)", opacity: "0" },
                    to: { transform: "translateX(0)", opacity: "1" },
                },
                "fade-in-up": {
                    from: { transform: "translateY(20px)", opacity: "0" },
                    to: { transform: "translateY(0)", opacity: "1" },
                },
                "scale-in": {
                    from: { transform: "scale(0.9)", opacity: "0" },
                    to: { transform: "scale(1)", opacity: "1" },
                },
                "blob": {
                    "0%, 100%": { transform: "translate(0, 0) scale(1)" },
                    "33%": { transform: "translate(30px, -50px) scale(1.1)" },
                    "66%": { transform: "translate(-20px, 20px) scale(0.9)" },
                },
                "spin-slow": {
                    from: { transform: "rotate(0deg)" },
                    to: { transform: "rotate(360deg)" },
                },
            },
            animation: {
                "accordion-down": "accordion-down 0.2s ease-out",
                "accordion-up": "accordion-up 0.2s ease-out",
                "shimmer": "shimmer 2s infinite",
                "float": "float 3s ease-in-out infinite",
                "pulse-glow": "pulse-glow 2s ease-in-out infinite",
                "slide-in-right": "slide-in-right 0.3s ease-out",
                "slide-in-left": "slide-in-left 0.3s ease-out",
                "fade-in-up": "fade-in-up 0.5s ease-out",
                "scale-in": "scale-in 0.3s ease-out",
                "blob": "blob 7s infinite",
                "spin-slow": "spin-slow 3s linear infinite",
            },
        },
    },
    plugins: [require("tailwindcss-animate")],
};

export default config;
