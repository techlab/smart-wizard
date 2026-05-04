import { defineConfig } from 'vite';
import { resolve } from 'path';

export default defineConfig({
    root: resolve(__dirname, '../../../examples/vanilla'),
    resolve: {
        alias: {
            '@smartwizard/core': resolve(__dirname, '../../core/src/index.ts'),
            '@smartwizard/ui': resolve(__dirname, '../../ui/src/main.scss'),
        },
    },
    server: {
        port: 3001,
        open: '/',
    },
});
