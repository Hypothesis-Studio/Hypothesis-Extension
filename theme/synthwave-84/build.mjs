#!/usr/bin/env node
/**
 * build.mjs â€” Build .hyp extension from this folder.
 *
 * Usage:
 *   npm run build          â†’ output: dist/<id>-<version>.hyp
 *   npm run build:dev      â†’ output: dist/<id>-<version>-dev.hyp
 *   node build.mjs         â†’ same as npm run build
 *   node build.mjs --dev   â†’ same as npm run build:dev
 *
 * The .hyp file is a tar archive of the extension folder
 * (excluding node_modules, dist, .git, build.mjs, package-lock.json).
 */
import { readFileSync, writeFileSync, mkdirSync, readdirSync, statSync, existsSync, rmSync } from 'fs';
import { join, dirname, basename, relative, resolve } from 'path';
import { execSync } from 'child_process';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// â”€â”€ Read manifest â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
const manifestPath = join(__dirname, 'package.json');

let manifest;
try {
  manifest = JSON.parse(readFileSync(manifestPath, 'utf-8'));
} catch (e) {
  console.error('âŒ Cannot read manifest:', manifestPath);
  process.exit(1);
}

const extId = manifest.id || 'extension';
const extVersion = manifest.version || '1.0.0';
const isDev = process.argv.includes('--dev');
const suffix = isDev ? '-dev' : '';

// â”€â”€ Prepare output â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
const distDir = join(__dirname, 'dist');
if (!existsSync(distDir)) mkdirSync(distDir, { recursive: true });

const hypName = `${extId}-${extVersion}${suffix}.hyp`;
const hypPath = join(distDir, hypName);

// â”€â”€ Create temp staging dir â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
const tmpName = `_build_tmp_${Date.now()}`;
const tmpDir = join(__dirname, tmpName);

const EXCLUDE = new Set(['node_modules', 'dist', '.git', 'build.mjs', 'package-lock.json', tmpName]);

function copyDir(src, dest) {
  mkdirSync(dest, { recursive: true });
  for (const entry of readdirSync(src, { withFileTypes: true })) {
    if (EXCLUDE.has(entry.name)) continue;
    const srcPath = join(src, entry.name);
    const destPath = join(dest, entry.name);
    if (entry.isDirectory()) {
      copyDir(srcPath, destPath);
    } else {
      writeFileSync(destPath, readFileSync(srcPath));
    }
  }
}

console.log(`ðŸ“¦ Packaging: ${manifest.name || extId} v${extVersion}${isDev ? ' (dev)' : ''}`);
console.log(`   Source:    ${__dirname}`);

try {
  // Copy to temp
  copyDir(__dirname, tmpDir);

  // tar it
  const parentDir = dirname(tmpDir);
  const folderName = basename(tmpDir);
  execSync(`tar -cf "${hypPath}" -C "${parentDir}" "${folderName}"`, { stdio: 'pipe' });

  // Cleanup temp
  rmSync(tmpDir, { recursive: true, force: true });

  const size = statSync(hypPath).size;
  console.log(`   Output:    ${hypPath}`);
  console.log(`   Size:      ${(size / 1024).toFixed(1)} KB`);
  console.log(`\nâœ… Created: ${hypName}`);
  console.log(`\nTo install:`);
  console.log(`  1. Open Hypothesis Editor`);
  console.log(`  2. Extensions sidebar â†’ click + button`);
  console.log(`  3. Select: dist/${hypName}`);
  console.log(`  Or drag dist/${hypName} into the editor window`);
} catch (e) {
  // Cleanup on failure
  try { rmSync(tmpDir, { recursive: true, force: true }); } catch {}
  console.error('âŒ Build failed:', e.message);
  process.exit(1);
}
