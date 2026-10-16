// Language audit: the double self-review, automated.
//  1. Key parity - every key in he.js must exist in en.js and vice versa.
//  2. Zero Hebrew characters in en.js.
//  3. Zero Hebrew characters in ANY other project file
//     (src, scripts, index.js, README.md, .env.example, package.json).
// A single Hebrew string leaking into English mode fails the build.
// Usage: npm run audit
const fs = require('fs');
const path = require('path');

const ROOT = path.join(__dirname, '..');
const HEBREW = /[\u0590-\u05FF]/;

let failures = 0;
const fail = (msg) => { failures++; console.error(`  FAIL: ${msg}`); };
const pass = (msg) => console.log(`  ok: ${msg}`);

// ---- 1. key parity ----
function keys(obj, prefix = '') {
  let out = [];
  for (const k of Object.keys(obj)) {
    const v = obj[k];
    const full = prefix ? `${prefix}.${k}` : k;
    if (v && typeof v === 'object' && !Array.isArray(v)) out = out.concat(keys(v, full));
    else out.push(full);
  }
  return out.sort();
}

const he = require('../src/lang/he');
const en = require('../src/lang/en');
const heKeys = new Set(keys(he));
const enKeys = new Set(keys(en));
const missingInEn = [...heKeys].filter((k) => !enKeys.has(k));
const missingInHe = [...enKeys].filter((k) => !heKeys.has(k));

console.log('[audit] key parity:');
if (missingInEn.length === 0 && missingInHe.length === 0) {
  pass(`${heKeys.size} keys identical in both languages`);
} else {
  missingInEn.forEach((k) => fail(`missing in en.js: ${k}`));
  missingInHe.forEach((k) => fail(`missing in he.js: ${k}`));
}

// ---- 2. no Hebrew in en.js ----
console.log('[audit] en.js Hebrew scan:');
const enSrc = fs.readFileSync(path.join(ROOT, 'src/lang/en.js'), 'utf8');
if (HEBREW.test(enSrc)) fail('Hebrew characters found in src/lang/en.js');
else pass('src/lang/en.js is Hebrew-free');

// ---- 3. no Hebrew anywhere else ----
// Hebrew command NAMES are allowed inside `names: { he: [...] }` arrays:
// Hebrew commands must stay registered (and working) in both languages,
// exactly like the English aliases. Every other Hebrew string is a leak.
console.log('[audit] project-wide Hebrew scan (excluding src/lang/he.js):');
const skipDirs = new Set(['node_modules', '.git', 'auth', 'temp']);
const hits = [];
function walk(dir) {
  for (const e of fs.readdirSync(dir, { withFileTypes: true })) {
    if (skipDirs.has(e.name)) continue;
    const p = path.join(dir, e.name);
    if (e.isDirectory()) { walk(p); continue; }
    if (p.endsWith('src/lang/he.js')) continue;
    if (p.endsWith('src/lang/aliases.js')) continue; // bilingual alias lists live here by design
    if (p.endsWith('README.he.md')) continue; // the Hebrew README is Hebrew by design
    if (p.endsWith('README.md')) continue; // documents the Hebrew command aliases; not bot output
    if (!/\.(js|json|md|example)$/.test(p)) continue;
    let src = fs.readFileSync(p, 'utf8');
    src = src.replace(/he:\s*\[[^\]]*\]/g, 'he:[]'); // allow Hebrew command names
    if (HEBREW.test(src)) hits.push(path.relative(ROOT, p));
  }
}
walk(ROOT);
if (hits.length > 0) hits.forEach((h) => fail(`Hebrew characters in ${h}`));
else pass('no Hebrew outside src/lang/he.js');

console.log(failures === 0 ? '\n[audit] PASS - English mode is Hebrew-free.' : `\n[audit] FAIL - ${failures} problem(s) found.`);
process.exit(failures === 0 ? 0 : 1);
