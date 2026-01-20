/** @type {import('tailwindcss').Config} */
export default {
    content: ['./src/**/*.{js,ts,jsx,tsx,html}'],
    corePlugins: {
        preflight: false,
    },
    theme: {
        extend: {
            colors: {
                seenyt: {
                    gold: '#CDAD5A',
                    teal: '#008080',
                    dark: '#1a1a08',
                },
            },
        },
    },
    plugins: [],
};
