// Bilingual subcommand / unit aliases.
// Hebrew entries must be recognized in BOTH bot languages (just like the
// Hebrew command names in `names.he`), so they are declared here in one
// place instead of being scattered through the command files.
// The language audit (npm run audit) whitelists this file alongside
// src/lang/he.js - every other file must stay Hebrew-free.
module.exports = {
  on: ['הפעל', 'on'],
  off: ['כבה', 'off'],
  block: ['חסום', 'block'],
  allow: ['התר', 'allow'],
  status: ['מצב', 'status'],
  perm: ['הרשאה', 'perm'],
  permEveryone: ['כולם', 'everyone'],
  permAuthorized: ['מורשים', 'authorized'],
  grouppermsAllow: ['אפשר', 'allow'],
  grouppermsDeny: ['חסום', 'deny'],
  tttStart: ['התחל', 'start'],
  tttMove: ['מהלך', 'move'],
  tttCancel: ['בטל', 'cancel'],
  remindMin: ['דק', 'דקות', 'min', 'mins', 'minute', 'minutes'],
  remindHour: ['שע', 'שעות', 'hour', 'hr', 'hrs', 'hours'],
  remindDay: ['ימ', 'ימים', 'day', 'days'],
};

// true when `value` equals (or starts with) any alias in the list.
function matches(list, value) {
  const v = String(value || '').toLowerCase();
  return list.some((a) => v === a || v.startsWith(a));
}

module.exports.matches = matches;
