import { defineConfig } from 'vite';
import { resolve } from 'path';

export default defineConfig({
    root: resolve(__dirname, 'src'),
    resolve: {
        alias: {
            '@smartwizard/core': resolve(__dirname, '../../packages/core/src/index.ts'),
            '@smartwizard/ui': resolve(__dirname, '../../packages/ui/src/main.scss'),
        },
    },
    server: {
        port: 3001,
        open: '/',
    },
});