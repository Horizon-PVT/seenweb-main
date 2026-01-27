import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import { resolve } from 'path';

export default defineConfig({
    plugins: [react()],
    publicDir: false,
    build: {
        outDir: 'dist/assets',
        emptyOutDir: false,
        minify: true,
        lib: {
            entry: resolve(__dirname, 'src/content/index.tsx'),
            name: 'SeenYTVeoContent',
            fileName: () => 'content.js',
            formats: ['iife'],
        },
        rollupOptions: {
            output: {
                inlineDynamicImports: true,
                extend: true,
            },
        },
    },
    resolve: {
        alias: {
            '@': resolve(__dirname, 'src'),
        },
    },
});
