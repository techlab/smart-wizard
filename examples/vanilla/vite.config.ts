import { defineConfig } from 'vite';
import { resolve } from 'path';

export default defineConfig({
    root: resolve(__dirname, 'src'),
    resolve: {
        alias: {
            '@smart-wizard/core': resolve(__dirname, '../../packages/core/src/index.ts'),
            // Sub-path aliases to handle themes and the "full" bundle
            // '@smart-wizard/ui/themes': resolve(__dirname, '../../packages/ui/src/themes'),
            // '@smart-wizard/ui/full': resolve(__dirname, '../../packages/ui/src/full.scss'),
            // '@smart-wizard/ui': resolve(__dirname, '../../packages/ui/src/core.scss'),
        },
    },
    server: {
        port: 3001,
        open: '/',
    },
});