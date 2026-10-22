#!/usr/bin/env node
/**
 * sync-version.mjs
 * Reads the version from packages/core/package.json and writes it
 * to the root package.json. Run automatically after `changeset version`.
 */

import { readFileSync, writeFileSync } from 'fs';
import { resolve, dirname } from 'path';
import { fileURLToPath } from 'url';

const __dirname = dirname(fileURLToPath(import.meta.url));
const root = resolve(__dirname, '..');

const corePkgPath = resolve(root, 'packages/core/package.json');
const rootPkgPath = resolve(root, 'package.json');

const corePkg = JSON.parse(readFileSync(corePkgPath, 'utf-8'));
const rootPkg = JSON.parse(readFileSync(rootPkgPath, 'utf-8'));

const prev = rootPkg.version;
rootPkg.version = corePkg.version;

writeFileSync(rootPkgPath, JSON.stringify(rootPkg, null, 4) + '\n', 'utf-8');

console.log(`✔ Root package.json version synced: ${prev} → ${corePkg.version}`);
