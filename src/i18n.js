// Bilingual string lookup. The active language comes from BOT_LANG.
// Design rule: a missing key NEVER falls back to the other language -
// it returns a loud [key] marker instead. That is what makes it
// impossible for a Hebrew string to leak through in English mode.
// Run `npm run audit` to verify (key parity + zero Hebrew in en).
const cfg = require('./config');

const dicts = {
  he: require('./lang/he'),
  en: require('./lang/en'),
};

function lang() {
  return dicts[cfg.BOT_LANG] ? cfg.BOT_LANG : 'he';
}

// Current language dictionary (for arrays like jokes/quotes).
function dict() {
  return dicts[lang()];
}

// t('group.warn.warned', { mention: '@123', count: 2 })
function t(key, vars) {
  const parts = String(key).split('.');
  let v = dicts[lang()];
  for (const p of parts) {
    if (v && typeof v === 'object' && p in v) v = v[p];
    else { v = undefined; break; }
  }
  if (typeof v !== 'string') return `[${key}]`;
  if (!vars) return v;
  return v.replace(/\{(\w+)\}/g, (_, k) => (vars[k] !== undefined ? String(vars[k]) : `{${k}}`));
}

module.exports = { t, dict, lang };
