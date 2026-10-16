// Anti-delete + view-once capture.
// A small in-memory ring buffer keeps recent messages (text always,
// media buffers only when ANTI_DELETE_MEDIA=true). When someone deletes
// a message for everyone (protocolMessage type REVOKE), the cached copy
// is forwarded to the owners. View-once media is forwarded on arrival.
const { downloadMediaMessage } = require('@whiskeysockets/baileys');
const cfg = require('../config');
const { t, lang } = require('../i18n');
const { extractText, unwrapViewOnce, mediaKind, senderPart, userPart } = require('../utils');

const MAX_CACHE = 500;
const cache = new Map(); // `${remoteJid}|${id}` -> entry

function cacheKey(key) {
  return `${key.remoteJid}|${key.id}`;
}

function chatLabel(sock, jid) {
  if (!jid.endsWith('@g.us')) return t('sys.antidelete.privateChat');
  return jid;
}

async function cacheMessage(sock, msg) {
  try {
    const key = msg.key;
    if (!key || !key.id) return;
    if (key.remoteJid === 'status@broadcast') return;
    if (msg.message?.protocolMessage) return;

    const inner = unwrapViewOnce(msg);
    const target = inner ? { key, message: inner } : msg;
    const kind = mediaKind(target);
    const entry = {
      jid: key.remoteJid,
      senderPart: senderPart(msg),
      senderName: msg.pushName || senderPart(msg),
      text: extractText(target),
      kind,
      buffer: null,
      ts: Date.now(),
    };

    if (kind && cfg.ANTI_DELETE_MEDIA) {
      try {
        entry.buffer = await downloadMediaMessage(target, 'buffer', {});
      } catch (e) {
        console.error('[MeowBot] antidelete media download failed:', e.message);
      }
    }

    cache.set(cacheKey(key), entry);
    if (cache.size > MAX_CACHE) {
      const oldest = cache.keys().next().value;
      cache.delete(oldest);
    }

    // View-once: forward immediately on arrival.
    if (inner && cfg.SAVE_VIEW_ONCE) {
      await forwardViewOnce(sock, entry);
    }
  } catch (e) {
    console.error('[MeowBot] antidelete cache error:', e.message);
  }
}

async function forwardToOwners(sock, payload) {
  for (const jid of cfg.OWNER_JIDS) {
    try {
      await sock.sendMessage(jid, payload);
    } catch (e) {
      console.error('[MeowBot] antidelete forward failed:', e.message);
    }
  }
}

async function forwardViewOnce(sock, entry) {
  const caption = t('sys.antidelete.viewonce', { user: entry.senderName, chat: chatLabel(sock, entry.jid) });
  if (entry.buffer) {
    const mediaPayload =
      entry.kind === 'image' ? { image: entry.buffer, caption } :
      entry.kind === 'video' ? { video: entry.buffer, caption } :
      { document: entry.buffer, mimetype: 'application/octet-stream', fileName: `viewonce-${Date.now()}`, caption };
    await forwardToOwners(sock, mediaPayload);
  } else {
    await forwardToOwners(sock, { text: caption });
  }
}

// Called from the router when a REVOKE protocol message arrives.
async function handleRevoke(sock, msg) {
  if (!cfg.ANTI_DELETE) return;
  try {
    const revokedKey = msg.message.protocolMessage.key;
    if (!revokedKey) return;
    const entry = cache.get(cacheKey(revokedKey));
    if (!entry) return;
    cache.delete(cacheKey(revokedKey));

    const title = t('sys.antidelete.title', { user: entry.senderName, chat: chatLabel(sock, entry.jid) });
    const text = title + (entry.text ? t('sys.antidelete.content', { text: entry.text }) : '');
    if (entry.buffer) {
      const mediaPayload =
        entry.kind === 'image' ? { image: entry.buffer, caption: text } :
        entry.kind === 'video' ? { video: entry.buffer, caption: text } :
        entry.kind === 'audio' ? { audio: entry.buffer, mimetype: 'audio/ogg; codecs=opus', ptt: true } :
        { document: entry.buffer, mimetype: 'application/octet-stream', fileName: `deleted-${Date.now()}`, caption: text };
      await forwardToOwners(sock, mediaPayload);
    } else {
      await forwardToOwners(sock, { text });
    }
  } catch (e) {
    console.error('[MeowBot] antidelete revoke error:', e.message);
  }
}

module.exports = { cacheMessage, handleRevoke };
