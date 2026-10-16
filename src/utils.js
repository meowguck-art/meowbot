// Shared Baileys helpers. All comments and logs are English-only
// (the language audit scans every file except src/lang/he.js).
const cfg = require('./config');

const sleep = (ms) => new Promise((r) => setTimeout(r, ms));

// '9725xxxx:12@s.whatsapp.net' -> '9725xxxx' ; '123@lid' -> '123'
function userPart(jid) {
  return String(jid || '').split('@')[0].split(':')[0];
}

function senderPart(msg) {
  const jid = msg.key.participant || msg.key.remoteJidAlt || msg.key.remoteJid;
  return userPart(jid);
}

function mention(part) {
  return `@${part}`;
}

function extractText(msg) {
  const m = msg.message || {};
  return (
    m.conversation ||
    m.extendedTextMessage?.text ||
    m.imageMessage?.caption ||
    m.videoMessage?.caption ||
    ''
  );
}

// Unwrap view-once containers; returns the inner message or null.
function unwrapViewOnce(msg) {
  const m = msg.message || {};
  const inner = m.viewOnceMessage?.message || m.viewOnceMessageV2?.message || m.viewOnceMessageV2Extension?.message;
  return inner || null;
}

function mediaKind(msg) {
  const m = msg.message || {};
  if (m.imageMessage) return 'image';
  if (m.videoMessage) return 'video';
  if (m.audioMessage) return 'audio';
  if (m.documentMessage) return 'document';
  if (m.stickerMessage) return 'sticker';
  return null;
}

// Group metadata with a 60s cache (avoids a fetch per message).
const metaCache = new Map();
async function groupMetadataCached(sock, jid) {
  const hit = metaCache.get(jid);
  if (hit && Date.now() - hit.ts < 60000) return hit.meta;
  const meta = await sock.groupMetadata(jid);
  metaCache.set(jid, { meta, ts: Date.now() });
  return meta;
}

async function isGroupAdmin(sock, groupJid, part) {
  try {
    const meta = await groupMetadataCached(sock, groupJid);
    const p = meta.participants.find((x) => userPart(x.id) === part);
    return !!p && (p.admin === 'admin' || p.admin === 'superadmin');
  } catch {
    return false;
  }
}

async function isBotAdmin(sock, groupJid) {
  const botPart = userPart(sock.user?.id);
  return isGroupAdmin(sock, groupJid, botPart);
}

// Quoted message info: text, sender part, and a key usable for delete().
function getQuoted(sock, msg) {
  const ctx = msg.message?.extendedTextMessage?.contextInfo;
  if (!ctx?.quotedMessage) return null;
  const qm = ctx.quotedMessage;
  const text =
    qm.conversation ||
    qm.extendedTextMessage?.text ||
    qm.imageMessage?.caption ||
    qm.videoMessage?.caption ||
    '';
  const qPart = userPart(ctx.participant || '');
  const ownPart = userPart(sock.user?.id);
  return {
    text,
    message: qm,
    part: qPart,
    key: {
      remoteJid: msg.key.remoteJid,
      id: ctx.stanzaId,
      fromMe: !!ctx.participant ? qPart === ownPart : !!msg.key.fromMe,
      participant: ctx.participant || undefined,
    },
  };
}

// Mentioned user part, or the quoted message sender part, or null.
function getTargetPart(msg, quoted) {
  const mentioned = msg.message?.extendedTextMessage?.contextInfo?.mentionedJid || [];
  if (mentioned.length > 0) return userPart(mentioned[0]);
  if (quoted) return quoted.part;
  return null;
}

module.exports = {
  sleep,
  userPart,
  senderPart,
  mention,
  extractText,
  unwrapViewOnce,
  mediaKind,
  groupMetadataCached,
  isGroupAdmin,
  isBotAdmin,
  getQuoted,
  getTargetPart,
};
