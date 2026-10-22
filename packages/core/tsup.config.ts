import { defineConfig } from 'tsup';
import pkg from './package.json';

// Banner for output files
const banner = `/*!
 * SmartWizard v${pkg.version}
 * ${pkg.description}
 * ${pkg.homepage}
 *
 * Created by ${(pkg.author as { name: string; url: string }).name} (${(pkg.author as { name: string; url: string }).url})
 *
 * Licensed under the terms of ${pkg.license}.
 */`;

export default defineConfig({
    entry: ['src/index.ts'],
    format: ['cjs', 'esm'],
    dts: true,
    banner: {
        js: banner,
    },
    clean: true,
});
