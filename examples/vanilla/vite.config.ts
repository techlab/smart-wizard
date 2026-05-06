import { defineConfig } from 'vite';
import { resolve } from 'path';

export default defineConfig({
    root: resolve(__dirname, 'src'),
    resolve: {
        alias: {
            '@smartwizard/core': resolve(__dirname, '../../packages/core/src/index.ts'),
            // '@smartwizard/ui': resolve(__dirname, '../../packages/ui/src/core.scss'),
            // Sub-path aliases to handle themes and the "full" bundle
            // '@smartwizard/ui/themes': resolve(__dirname, '../../packages/ui/src/themes'),
            // '@smartwizard/ui/full': resolve(__dirname, '../../packages/ui/src/full.scss'),
        },
    },
    server: {
        port: 3001,
        open: '/',
    },
});