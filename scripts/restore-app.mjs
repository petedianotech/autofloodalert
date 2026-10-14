#!/usr/bin/env node
/**
 * Restores src/App.tsx from the last known-good commit if the file is truncated/broken.
 * Runs automatically before build so CI and local builds always work.
 */
import { writeFileSync, readFileSync } from 'fs';
import { join, dirname } from 'path';
import { fileURLToPath } from 'url';

const __dirname = dirname(fileURLToPath(import.meta.url));
const root = join(__dirname, '..');
const appPath = join(root, 'src', 'App.tsx');

function isBroken(src) {
  if (!src || src.length < 5000) return true;
  if (!src.includes('export default function App')) return true;
  if (src.includes('PLACEHOLDER') || src.includes('App.restored')) return true;
  return false;
}

async function main() {
  let current = '';
  try {
    current = readFileSync(appPath, 'utf8');
  } catch {}

  if (!isBroken(current)) {
    console.log('[restore-app] App.tsx looks healthy, skipping restore.');
    return;
  }

  console.log('[restore-app] App.tsx is broken or truncated. Restoring from known-good commit...');
  const url =
    'https://raw.githubusercontent.com/petedianotech/autofloodalert/12932781aae1e897397372966dab74ee99ee0284/src/App.tsx';
  const res = await fetch(url);
  if (!res.ok) {
    console.error('[restore-app] Failed to download good App.tsx:', res.status);
    process.exit(1);
  }
  const good = await res.text();
  if (isBroken(good)) {
    console.error('[restore-app] Downloaded content still looks broken.');
    process.exit(1);
  }
  writeFileSync(appPath, good, 'utf8');
  console.log('[restore-app] Restored src/App.tsx successfully (' + good.length + ' bytes).');
}

main().catch((e) => {
  console.error('[restore-app]', e);
  process.exit(1);
});
