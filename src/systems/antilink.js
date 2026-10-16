// Anti-link: deletes (and optionally kicks on) forbidden links.
// Per-group settings live in db.data.antilink[chatJid].
const { db } = require('../db');
const { t } = require('../i18n');
const { extractText, mention, isGroupAdmin, isBotAdmin, userPart } = require('../utils');

function isLinkAllowed(link, s) {
  if ((s.whitelist || []).some((w) => link.includes(w))) return true;
  if ((s.blacklist || []).includes('*') && !(s.whitelist || []).some((w) => link.includes(w))) return false;
  try {
    const host = new URL(link).hostname;
    if ((s.blacklist || []).some((b) => b !== '*' && host.includes(b))) return false;
  } catch {
    return false;
  }
  return true;
}

// Returns true when the message was handled (caller should stop).
async function check(sock, ctx, msg) {
  if (!ctx.isGroup || ctx.isOwner) return false;
  const s = db.data.antilink[ctx.chatJid];
  if (!s || !s.enabled) return false;
  const text = ctx.text;
  if (!text) return false;
  const links = text.match(/https?:\/\/[^\s]+/g);
  if (!links || links.length === 0) return false;
  if (await isGroupAdmin(sock, ctx.chatJid, ctx.senderPart)) return false;

  const forbidden = links.some((l) => !isLinkAllowed(l, s));
  if (!forbidden) return false;

  const tag = mention(ctx.senderPart);
  await sock.sendMessage(ctx.chatJid, {
    text: t('group.antilink.warnMsg', { mention: tag }),
    mentions: [`${ctx.senderPart}@s.whatsapp.net`],
  });

  const mode = s.mode || 'delete_only';
  try {
    if (mode === 'delete_kick' || mode === 'warn_delete' || mode === 'delete_only') {
      await sock.sendMessage(ctx.chatJid, { delete: msg.key });
    }
    if (mode === 'delete_kick' && (await isBotAdmin(sock, ctx.chatJid))) {
      const meta = await sock.groupMetadata(ctx.chatJid);
      const victim = meta.participants.find((p) => userPart(p.id) === ctx.senderPart);
      if (victim && (victim.admin || meta.owner === victim.id)) {
        await sock.sendMessage(ctx.chatJid, {
          text: t('group.antilink.cantRemoveAdmin', { mention: tag }),
          mentions: [`${ctx.senderPart}@s.whatsapp.net`],
        });
      } else {
        await sock.groupParticipantsUpdate(ctx.chatJid, [`${ctx.senderPart}@s.whatsapp.net`], 'remove');
      }
    }
  } catch (e) {
    console.error('[MeowBot] antilink action failed:', e.message);
  }
  return true;
}

module.exports = { check };
