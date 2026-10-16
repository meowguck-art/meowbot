// General commands: media (YouTube / sticker / reminder).
// YouTube search results are shown as a CLASSIC ListMessage menu
// (baileys-buttons sendList) - renders on both Android and iPhone,
// unlike the interactive native_flow list. Tapping a row downloads it.
const { downloadMediaMessage } = require('@whiskeysockets/baileys');
const { sendList } = require('baileys-buttons');
const { db } = require('../db');
const states = require('../states');
const { searchYouTube, downloadAudio, sendDownloadedAudio } = require('../youtube');
const { ffmpegExists, toWebp } = require('../sticker');
const aliases = require('../lang/aliases');
const { mediaKind, mention } = require('../utils');
const fs = require('fs');

const MENU_TTL = 5 * 60 * 1000;

async function doDownload(c, video) {
  await c.reply(c.t('media.youtube.downloading', { title: video.title }));
  const file = await downloadAudio(video);
  await sendDownloadedAudio(c.sock, c.chatJid, file);
}

module.exports = [
  {
    id: 'youtube', names: { he: ['יוטיוב', 'שיר'], en: ['yt', 'youtube', 'song'] }, cat: 'tools', reaction: '🎵',
    async handler(c) {
      const query = c.args.join(' ').trim();
      if (!query) return c.reply(c.t('media.youtube.noQuery', { prefix: c.prefix }));
      await c.reply(c.t('media.youtube.searching', { query }));
      const results = await searchYouTube(query, 10);
      if (results.length === 0) return c.reply(c.t('media.youtube.failed'));
      if (/^https?:\/\//.test(query)) {
        // Direct link: download immediately, no menu needed.
        await doDownload(c, results[0]);
        return;
      }
      states.youtubeMenu.set(c.chatJid, { results, expires: Date.now() + MENU_TTL });
      await sendList(c.sock, c.chatJid, {
        title: '',
        text: c.t('media.youtube.menuTitle', { query }),
        buttonText: c.t('media.youtube.menuButton'),
        footer: c.t('media.youtube.menuFooter'),
        sections: [{
          title: c.t('media.youtube.sectionTitle'),
          rows: results.map((v, i) => ({
            id: `yt:${i}`,
            title: v.title.length > 60 ? v.title.slice(0, 57) + '...' : v.title,
            description: `${v.timestamp || ''} - ${v.author?.name || ''}`.slice(0, 72),
          })),
        }],
      });
    },
  },
  {
    id: 'sticker', names: { he: ['סטיקר'], en: ['sticker', 's'] }, cat: 'tools', reaction: '🖼️',
    async handler(c) {
      const target = c.quoted ? { key: c.quoted.key, message: c.quoted.message } : c.msg;
      const kind = mediaKind({ message: target.message });
      if (kind !== 'image' && kind !== 'video') return c.reply(c.t('media.sticker.needMedia'));
      if (!(await ffmpegExists())) return c.reply(c.t('media.sticker.noFfmpeg'));
      await c.reply(c.t('media.sticker.making'));
      const buf = await downloadMediaMessage(target, 'buffer', {});
      const inPath = `${require('../config').TEMP_DIR}/st-${Date.now()}`;
      fs.writeFileSync(inPath, buf);
      try {
        const webp = await toWebp(inPath);
        const out = fs.readFileSync(webp);
        await c.sock.sendMessage(c.chatJid, { sticker: out });
        try { fs.unlinkSync(webp); } catch {}
      } finally {
        try { fs.unlinkSync(inPath); } catch {}
      }
    },
  },
  {
    id: 'remind', names: { he: ['תזכורת'], en: ['remind'] }, cat: 'tools', reaction: '🔔',
    async handler(c) {
      const time = parseInt(c.args[0], 10);
      const unit = (c.args[1] || '').toLowerCase();
      const message = c.args.slice(2).join(' ');
      if (!Number.isFinite(time) || !unit || !message) {
        return c.reply(c.t('media.remind.usage', { prefix: c.prefix }));
      }
      let mult = null;
      if (aliases.matches(aliases.remindMin, unit)) mult = 60;
      else if (aliases.matches(aliases.remindHour, unit)) mult = 3600;
      else if (aliases.matches(aliases.remindDay, unit)) mult = 86400;
      if (!mult) return c.reply(c.t('media.remind.invalidUnit'));
      db.data.reminders.push({
        chatJid: c.chatJid,
        message,
        trigger_at: Math.floor(Date.now() / 1000) + time * mult,
      });
      await db.write();
      return c.reply(c.t('media.remind.ok', { time, unit: c.args[1] }));
    },
  },
];

// Called by the router when a classic list row is tapped.
async function handleYoutubeMenuPick(c, rowId) {
  const m = /^yt:(\d+)$/.exec(rowId || '');
  if (!m) return false;
  const pending = states.youtubeMenu.get(c.chatJid);
  if (!pending || pending.expires < Date.now()) {
    await c.reply(c.t('media.youtube.expired'));
    states.youtubeMenu.delete(c.chatJid);
    return true;
  }
  const video = pending.results[parseInt(m[1], 10)];
  states.youtubeMenu.delete(c.chatJid);
  if (!video) {
    await c.reply(c.t('media.youtube.invalidNumber'));
    return true;
  }
  await doDownload(c, video);
  return true;
}

module.exports.handleYoutubeMenuPick = handleYoutubeMenuPick;
