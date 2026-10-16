// Reminder cron: fires every minute, sends due reminders, deletes them.
const cron = require('node-cron');
const { db } = require('../db');
const { t } = require('../i18n');

let sockRef = null;
function attach(sock) { sockRef = sock; }

function start() {
  cron.schedule('* * * * *', async () => {
    if (!sockRef) return;
    try {
      await db.read();
      const now = Math.floor(Date.now() / 1000);
      const due = db.data.reminders.filter((r) => r.trigger_at <= now);
      for (const r of due) {
        try {
          await sockRef.sendMessage(r.chatJid, { text: t('sys.reminders.prefix', { message: r.message }) });
        } catch (e) {
          console.error('[MeowBot] reminder send failed:', e.message);
        }
      }
      if (due.length > 0) {
        db.data.reminders = db.data.reminders.filter((r) => r.trigger_at > now);
        await db.write();
      }
    } catch (e) {
      console.error('[MeowBot] reminder cron error:', e.message);
    }
  });
  console.log('[MeowBot] reminder cron started (every minute)');
}

module.exports = { start, attach };
