export default {
    content: ["./*.html", "./js/**/*.js"],
    theme: {
        extend: {
            colors: {
                primary: "var(--color-primary)",
                secondary: "var(--color-secondary)",
                accent: "var(--color-accent)",
                bg: "var(--color-bg)",
                surface: "var(--color-surface)",
                text: "var(--color-text)",
                muted: "var(--color-text-muted)"
            }
        }
    },
    darkMode: "class",
    plugins: []
}
