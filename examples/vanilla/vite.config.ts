import { defineConfig } from 'vite';
import { resolve } from 'path';

export default defineConfig({
    root: resolve(__dirname, 'src'),
    resolve: {
        alias: {
            '@smart-wizard/core': resolve(__dirname, '../../packages/core/src/index.ts'),
        },
    },
    server: {
        port: 3001,
        open: '/',
    },
});