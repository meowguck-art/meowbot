// Main message dispatcher.
// Pipeline per incoming message:
//   1. revoke protocol message -> anti-delete forward
//   2. cache message (anti-delete ring buffer + view-once capture)
//   3. anti-link enforcement
//   4. classic list row taps (YouTube menu picks)
//   5. trivia answers / tic-tac-toe digit shortcuts
//   6. command parse -> gates (owner/groupAdmin/auth) -> cooldown -> handler -> reaction
const { getListReplyId } = require('baileys-buttons');
const { findCommand, handleYoutubeMenuPick } = require('./commands');
const states = require('./states');
const { db, getUser } = require('./db');
const cfg = require('./config');
const { t, lang } = require('./i18n');
const utils = require('./utils');
const antilink = require('./systems/antilink');
const antidelete = require('./systems/antidelete');

const cooldowns = new Map(); // senderPart -> Map(commandId -> ts)

async function isAuthorized(part, chatJid, isOwner, isGroup) {
  if (isOwner) return true;
  if (cfg.BOT_MODE === 'public') return true;
  if (cfg.BOT_MODE === 'self') return false;
  await db.read();
  const u = db.data.users.find((x) => x.part === part);
  if (u && u.is_global_authorized) return true;
  if (isGroup) {
    const g = db.data.group_authorizations.find((a) => a.groupJid === chatJid && a.part === part);
    if (g) return true;
  }
  return false;
}

function buildCtx(sock, msg, text) {
  const chatJid = msg.key.remoteJid;
  const senderPart = utils.senderPart(msg);
  const isFromMe = !!msg.key.fromMe;
  const isOwner = isFromMe || cfg.OWNER_PARTS.includes(senderPart);
  const quoted = utils.getQuoted(sock, msg);
  const mentioned = (msg.message?.extendedTextMessage?.contextInfo?.mentionedJid || []).map(utils.userPart);
  return {
    sock, msg, cfg, t, prefix: cfg.PREFIX,
    chatJid,
    isGroup: chatJid.endsWith('@g.us'),
    senderPart,
    senderName: msg.pushName || senderPart,
    isFromMe,
    isOwner,
    authorized: false, // filled in onMessage
    text,
    args: [],
    quoted,
    mentionedParts: mentioned,
    targetPart: utils.getTargetPart(msg, quoted),
    reply: async (replyText, opts = {}) => {
      const payload = {};
      if (opts.imageUrl) {
        payload.image = { url: opts.imageUrl };
        payload.caption = replyText;
      } else {
        payload.text = replyText;
      }
      if (opts.mentions) payload.mentions = opts.mentions;
      return sock.sendMessage(chatJid, payload);
    },
    react: async (emoji) => {
      if (!cfg.REACTIONS_ENABLED) return;
      try {
        await sock.sendMessage(chatJid, { react: { text: emoji, key: msg.key } });
      } catch (e) {
        console.error('[MeowBot] react failed:', e.message);
      }
    },
  };
}

function checkCooldown(part, commandId) {
  if (cfg.COOLDOWN_SECONDS <= 0) return true;
  const now = Date.now();
  let m = cooldowns.get(part);
  if (!m) { m = new Map(); cooldowns.set(part, m); }
  const last = m.get(commandId) || 0;
  if (now - last < cfg.COOLDOWN_SECONDS * 1000) return false;
  m.set(commandId, now);
  return true;
}

function escapeRegex(s) {
  return s.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
}

async function onMessage(sock, msg) {
  try {
    if (!msg.message) return;
    if (msg.key.remoteJid === 'status@broadcast') return;

    // 1. delete-for-everyone -> forward the cached copy to owners
    if (msg.message.protocolMessage && msg.message.protocolMessage.type === 0) {
      await antidelete.handleRevoke(sock, msg);
      return;
    }

    // 2. cache (also forwards view-once media immediately)
    await antidelete.cacheMessage(sock, msg);

    const text = utils.extractText(msg);
    const ctx = buildCtx(sock, msg, text);

    // track the user (name refresh)
    const u = getUser(ctx.senderPart);
    if (u.name !== ctx.senderName) { u.name = ctx.senderName; await db.write(); }

    // 3. anti-link
    if (await antilink.check(sock, ctx, msg)) return;

    // 4. classic list taps (YouTube song menu)
    const listId = getListReplyId(msg.message);
    if (listId) {
      const authorized = await isAuthorized(ctx.senderPart, ctx.chatJid, ctx.isOwner, ctx.isGroup);
      if (!authorized) return;
      ctx.authorized = authorized;
      await handleYoutubeMenuPick(ctx, listId);
      return;
    }

    // 5a. trivia answers (plain text, no prefix needed)
    const tr = states.trivia.get(ctx.chatJid);
    if (tr && text.trim() && text.trim().toLowerCase() === tr.answer.toLowerCase()) {
      clearTimeout(tr.timer);
      states.trivia.delete(ctx.chatJid);
      const winner = getUser(ctx.senderPart);
      winner.reputation = (winner.reputation || 0) + 5;
      await db.write();
      await ctx.reply(t('fun.trivia.win', { mention: utils.mention(ctx.senderPart) }),
        { mentions: [`${ctx.senderPart}@s.whatsapp.net`] });
      return;
    }

    // 5b. tic-tac-toe digit shortcut: !5 while a game is active
    const game = states.tictactoe.get(ctx.chatJid);
    const trimmed = text.trim();
    let cmd = null;
    let args = [];
    if (game && trimmed.startsWith(cfg.PREFIX) && /^\d$/.test(trimmed.slice(cfg.PREFIX.length))) {
      cmd = findCommand('tictactoe');
      args = ['move', trimmed.slice(cfg.PREFIX.length)];
    } else {
      if (!trimmed.startsWith(cfg.PREFIX)) return;
      const parts = trimmed.slice(cfg.PREFIX.length).trim().split(/ +/);
      const name = (parts.shift() || '').toLowerCase();
      if (!name) return;
      cmd = findCommand(name);
      if (!cmd) return; // unknown command: stay silent
      args = parts;
    }
    ctx.args = args;

    // 6. gates
    if (cmd.gate === 'owner' && !ctx.isOwner) {
      await ctx.reply(t('common.ownerOnly'));
      return;
    }
    if (cmd.gate === 'groupAdmin') {
      if (!ctx.isGroup) return; // silently ignore outside groups
      const admin = ctx.isOwner || await utils.isGroupAdmin(sock, ctx.chatJid, ctx.senderPart);
      if (!admin) {
        await ctx.reply(t('common.needGroupAdmin'));
        return;
      }
      if (cmd.needBotAdmin && !(await utils.isBotAdmin(sock, ctx.chatJid))) {
        await ctx.reply(t('common.needBotAdmin'));
        return;
      }
    }
    const authorized = await isAuthorized(ctx.senderPart, ctx.chatJid, ctx.isOwner, ctx.isGroup);
    if (!authorized) return; // silent, like the original
    ctx.authorized = authorized;

    if (!ctx.isOwner && !checkCooldown(ctx.senderPart, cmd.id)) {
      await ctx.react('⏱️');
      return;
    }

    try {
      await cmd.handler(ctx);
      await ctx.react(cmd.reaction || '✅');
    } catch (e) {
      console.error(`[MeowBot] command "${cmd.id}" failed:`, e);
      try { await ctx.react('❌'); } catch {}
    }
  } catch (e) {
    console.error('[MeowBot] onMessage error:', e);
  }
}

async function onUpdate() {
  // Reserved for future use; revokes arrive via messages.upsert.
}

module.exports = { onMessage, onUpdate };
