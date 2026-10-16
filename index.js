// MeowBot v1.0 - modular bilingual Baileys command bot.
// Entry point: loads config, opens the DB, starts the reminder cron
// and connects to WhatsApp (pairing-code login on first run).
const cfg = require('./src/config');
const db = require('./src/db');
const router = require('./src/router');
const connection = require('./src/connection');
const reminders = require('./src/systems/reminders');

(async () => {
  console.log(`[MeowBot] boot | lang=${cfg.BOT_LANG} mode=${cfg.BOT_MODE} prefix="${cfg.PREFIX}"`);
  await db.init();
  reminders.start();
  await connection.start({
    onMessage: (sock, msg) => router.onMessage(sock, msg),
    onUpdate: (sock, updates) => router.onUpdate(sock, updates),
  });
})().catch((e) => {
  console.error('[MeowBot] fatal error during boot:', e);
  process.exit(1);
});
