import type { Config } from "tailwindcss";

const config: Config = {
    darkMode: "class",
    content: [
        "./src/pages/**/*.{js,ts,jsx,tsx,mdx}",
        "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
        "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
    ],
    theme: {
        extend: {
            colors: {
                background: "hsl(var(--background))",
                foreground: "hsl(var(--foreground))",
                // Pro Cinema Tokens
                cinema: {
                    black: "var(--void-bg)",
                    panel: "var(--void-panel)",
                    border: "var(--void-border)",
                    teal: "var(--cinema-teal)",
                    gold: "var(--cinema-gold)",
                    text: {
                        primary: "var(--text-primary)",
                        dim: "var(--text-dim)"
                    }
                },
                card: {
                    DEFAULT: "hsl(var(--card))",
                    foreground: "hsl(var(--card-foreground))",
                },
                popover: {
                    DEFAULT: "hsl(var(--popover))",
                    foreground: "hsl(var(--popover-foreground))",
                },
                primary: {
                    DEFAULT: "hsl(var(--primary))",
                    foreground: "hsl(var(--primary-foreground))",
                },
                secondary: {
                    DEFAULT: "hsl(var(--secondary))",
                    foreground: "hsl(var(--secondary-foreground))",
                },
                muted: {
                    DEFAULT: "hsl(var(--muted))",
                    foreground: "hsl(var(--muted-foreground))",
                },
                accent: {
                    DEFAULT: "hsl(var(--accent))",
                    foreground: "hsl(var(--accent-foreground))",
                },
                destructive: {
                    DEFAULT: "hsl(var(--destructive))",
                    foreground: "hsl(var(--destructive-foreground))",
                },
                border: "hsl(var(--border))",
                input: "hsl(var(--input))",
                ring: "hsl(var(--ring))",
                "director-bg": "var(--director-bg)",
                "director-surface-1": "var(--director-surface-1)",
                "director-surface-2": "var(--director-surface-2)",
                "director-text": "var(--director-text)",
                chart: {
                    "1": "hsl(var(--chart-1))",
                    "2": "hsl(var(--chart-2))",
                    "3": "hsl(var(--chart-3))",
                    "4": "hsl(var(--chart-4))",
                    "5": "hsl(var(--chart-5))",
                },
                // Premium Director's Cut Palette (True Void System)
                // 'director-black': '#09090b', // Zinc-950 - Use var(--director-bg) instead
                // 'director-panel': '#18181b', // Zinc-900 - Use var(--director-surface-1) instead
                'director-teal': {
                    DEFAULT: '#22d3ee', // Cyan-400
                    hover: '#67e8f9',   // Cyan-300
                    active: '#06b6d4'   // Cyan-500
                },
                'director-gold': '#facc15', // Yellow-400
                // 'director-text': '#e4e4e7', // Zinc-200 - Use var(--director-text) instead
                'border-DEFAULT': '#27272a', // Zinc-800
            },
            borderRadius: {
                lg: "12px",
                md: "8px",
                sm: "4px",
            },
            backgroundImage: {
                'film-grain': "url('/film-grain.png')", // We will implement opacity in CSS
            }
        },
    },
    plugins: [],
};
export default config;
