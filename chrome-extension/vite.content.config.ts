import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import { resolve } from 'path';

export default defineConfig({
    plugins: [react()],
    publicDir: false, // Prevent duplicating public folder content here
    build: {
        outDir: 'dist/assets',
        emptyOutDir: false,
        minify: true,
        lib: {
            entry: resolve(__dirname, 'src/content/index.tsx'),
            name: 'SeenYTContent',
            fileName: () => 'content.js',
            formats: ['iife'],
        },
        rollupOptions: {
            output: {
                // Critical: Inline all dynamic imports into one file
                inlineDynamicImports: true,
                // Ensure no external dependencies
                extend: true,
                // Force single file output
                manualChunks: undefined,
            },
            // Do NOT externalize anything - bundle everything
            external: [],
        },
        // Ensure all dependencies are bundled
        commonjsOptions: {
            include: [/node_modules/],
        },
    },
    define: {
        'process.env': {},
        'process.env.NODE_ENV': JSON.stringify('production'),
    },
    // Resolve all imports from node_modules
    resolve: {
        alias: {
            '@': resolve(__dirname, 'src'),
        },
    },
});
