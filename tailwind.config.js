/** @type {import('tailwindcss').Config} */
export default {
    content: ["./src/**/*.{ts,js,css}"],
    // Prefix all classes with 'kt-' to avoid conflicts with host page
    prefix: "kt-",
    theme: {
        extend: {
            colors: {
                primary: "#3a86ff",
                secondary: "#007bff",
                "glass-bg": "rgba(30, 30, 30, 0.95)",
                "glass-border": "rgba(255, 255, 255, 0.1)",
            },
            backdropBlur: {
                glass: "20px",
            },
            animation: {
                "fade-in": "fadeIn 0.3s ease",
                "scale-in": "scaleIn 0.3s cubic-bezier(0.4, 0, 0.2, 1)",
            },
            keyframes: {
                fadeIn: {
                    "0%": { opacity: "0" },
                    "100%": { opacity: "1" },
                },
                scaleIn: {
                    "0%": { transform: "scale(0.95) translateY(20px)" },
                    "100%": { transform: "scale(1) translateY(0)" },
                },
            },
        },
    },
    plugins: [],
};
