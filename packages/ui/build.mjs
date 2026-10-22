#!/usr/bin/env node
/**
 * Build script for @smart-wizard/ui
 * Compiles SCSS → CSS, adds a license banner, then minifies with PostCSS.
 */

import { execSync } from 'child_process';
import { readFileSync, writeFileSync, readdirSync } from 'fs';
import { resolve, join, dirname } from 'path';
import { fileURLToPath } from 'url';

const __dirname = dirname(fileURLToPath(import.meta.url));

// Read package metadata
const pkg = JSON.parse(readFileSync(resolve(__dirname, 'package.json'), 'utf-8'));

// Build the banner comment
const banner = `/*!
 * SmartWizard UI v${pkg.version}
 * ${pkg.description}
 * ${pkg.homepage}
 *
 * Created by ${pkg.author.name} (${pkg.author.url})
 *
 * Licensed under the terms of ${pkg.license}.
 */`;

/**
 * Prepend the banner to a CSS file.
 * @param {string} filePath - Absolute path to the CSS file.
 */
function prependBanner(filePath) {
    const original = readFileSync(filePath, 'utf-8');
    writeFileSync(filePath, banner + '\n' + original, 'utf-8');
    console.log(`  ✔ Banner added → ${filePath.replace(__dirname + '/', '')}`);
}

function run(cmd) {
    console.log(`\n> ${cmd}`);
    execSync(cmd, { stdio: 'inherit', cwd: __dirname });
}

// ─── Build core ──────────────────────────────────────────────────────────────
console.log('\n📦 Building core CSS…');
run('sass src/core.scss dist/smartwizard.css');
prependBanner(resolve(__dirname, 'dist/smartwizard.css'));
run('postcss dist/smartwizard.css -u autoprefixer cssnano -o dist/smartwizard.min.css --no-map');
prependBanner(resolve(__dirname, 'dist/smartwizard.min.css'));

// ─── Build full ───────────────────────────────────────────────────────────────
console.log('\n📦 Building full CSS…');
run('sass src/full.scss dist/smartwizard-full.css');
prependBanner(resolve(__dirname, 'dist/smartwizard-full.css'));
run('postcss dist/smartwizard-full.css -u autoprefixer cssnano -o dist/smartwizard-full.min.css --no-map');
prependBanner(resolve(__dirname, 'dist/smartwizard-full.min.css'));

// ─── Build themes ─────────────────────────────────────────────────────────────
console.log('\n📦 Building themes…');
run('sass --load-path=src src/themes:dist/themes');
// Add banner to each generated theme CSS (non-minified)
const themesDir = resolve(__dirname, 'dist/themes');
const themeFiles = readdirSync(themesDir).filter(f => f.endsWith('.css') && !f.endsWith('.min.css'));
for (const file of themeFiles) {
    prependBanner(join(themesDir, file));
}
run('postcss "dist/themes/*.css" !"dist/themes/*.min.css" -u autoprefixer cssnano --dir dist/themes --ext .min.css --no-map');
// Add banner to minified theme files
const minThemeFiles = readdirSync(themesDir).filter(f => f.endsWith('.min.css'));
for (const file of minThemeFiles) {
    prependBanner(join(themesDir, file));
}

console.log('\n✅ @smart-wizard/ui build complete.\n');
