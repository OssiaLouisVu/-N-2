/** @type {import('tailwindcss').Config} */
export default {
    content: [
        './index.html',
        './src/**/*.{js,jsx,ts,tsx}',
    ],
    theme: {
        extend: {
            fontFamily: {
                sans: ['system-ui', '-apple-system', 'BlinkMacSystemFont', 'Segoe UI', 'Roboto', 'sans-serif'],
            },
            colors: {
                brand: {
                    50: '#f0f7ff',
                    100: '#dcefff',
                    200: '#baddff',
                    300: '#82c4ff',
                    400: '#45a8ff',
                    500: '#1677ff',
                    600: '#0d5ed1',
                    700: '#0b4aa6',
                    800: '#0d3f80',
                    900: '#0f3564'
                }
            },
            boxShadow: {
                card: '0 4px 12px -2px rgba(0,0,0,0.08), 0 8px 24px -4px rgba(0,0,0,0.06)'
            }
        },
    },
    plugins: [],
};