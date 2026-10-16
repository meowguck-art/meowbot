// General commands: everyday tools.
const axios = require('axios');
const { downloadMediaMessage } = require('@whiskeysockets/baileys');
const { lang, dict } = require('../i18n');
const { userPart, mention, mediaKind } = require('../utils');

module.exports = [
  {
    id: 'ping', names: { he: ['פינג'], en: ['ping'] }, cat: 'tools', reaction: '🏓',
    async handler(c) {
      const ms = Date.now() - Number(c.msg.messageTimestamp) * 1000;
      return c.reply(c.t('tools.ping.pong', { ms }));
    },
  },
  {
    id: 'del', names: { he: ['מחק'], en: ['del', 'delete'] }, cat: 'tools', reaction: '🗑️',
    async handler(c) {
      if (!c.quoted) return c.reply(c.t('tools.del.needQuote'));
      if (!c.quoted.key.fromMe) return c.reply(c.t('tools.del.notMine'));
      await c.sock.sendMessage(c.chatJid, { delete: c.quoted.key });
    },
  },
  {
    id: 'me', names: { he: ['אני'], en: ['me'] }, cat: 'tools', reaction: '🆔',
    async handler(c) {
      let about = '';
      try {
        const st = await c.sock.fetchStatus(`${c.senderPart}@s.whatsapp.net`);
        about = st?.status || '';
      } catch {}
      return c.reply(c.t('tools.me.card', { name: c.senderName, number: c.senderPart, about }));
    },
  },
  {
    id: 'getpp', names: { he: ['תמונתפרופיל'], en: ['getpp', 'pp'] }, cat: 'tools', reaction: '👤',
    async handler(c) {
      const part = c.targetPart || c.senderPart;
      const tag = mention(part);
      let url = null;
      try { url = await c.sock.profilePictureUrl(`${part}@s.whatsapp.net`, 'image'); } catch {}
      if (!url) return c.reply(c.t('tools.getpp.none', { mention: tag }));
      return c.reply(c.t('tools.getpp.caption', { mention: tag }), { imageUrl: url });
    },
  },
  {
    id: 'wiki', names: { he: ['ויקי'], en: ['wiki'] }, cat: 'tools', reaction: '🌐',
    async handler(c) {
      const term = c.args.join(' ').trim();
      if (!term) return c.reply(c.t('tools.wiki.needTerm', { prefix: c.prefix }));
      const host = lang() === 'he' ? 'he.wikipedia.org' : 'en.wikipedia.org';
      return c.reply(`https://${host}/wiki/${encodeURIComponent(term.replace(/ +/g, '_'))}`);
    },
  },
  {
    id: 'joke', names: { he: ['בדיחה'], en: ['joke'] }, cat: 'tools', reaction: '😂',
    async handler(c) {
      const jokes = dict().fun.jokes;
      return c.reply(jokes[Math.floor(Math.random() * jokes.length)]);
    },
  },
  {
    id: 'quote', names: { he: ['ציטוט'], en: ['quote'] }, cat: 'tools', reaction: '✍️',
    async handler(c) {
      const quotes = dict().fun.quotes;
      return c.reply(quotes[Math.floor(Math.random() * quotes.length)]);
    },
  },
  {
    id: 'search', names: { he: ['חיפוש'], en: ['search'] }, cat: 'tools', reaction: '🔎',
    async handler(c) {
      const q = c.args.join(' ').trim();
      if (!q) return c.reply(c.t('tools.search.needQuery'));
      const url = `https://www.google.com/search?q=${encodeURIComponent(q)}&hl=${lang()}`;
      return c.reply(c.t('tools.search.title', { query: q, url }));
    },
  },
  {
    id: 'shorten', names: { he: ['קיצור'], en: ['shorten'] }, cat: 'tools', reaction: '✂️',
    async handler(c) {
      const link = c.args[0];
      if (!link || !/^https?:\/\//.test(link)) return c.reply(c.t('tools.shorten.needUrl'));
      const { data } = await axios.get(`https://tinyurl.com/api-create.php?url=${encodeURIComponent(link)}`);
      return c.reply(c.t('tools.shorten.ok', { url: data }));
    },
  },
  {
    id: 'link', names: { he: ['לינק'], en: ['link'] }, cat: 'tools', reaction: '📲',
    async handler(c) {
      const raw = (c.args[0] || '').replace(/[^0-9]/g, '');
      if (!raw) return c.reply(c.t('tools.link.needNumber'));
      const clean = raw.startsWith('972') ? raw : `972${raw.replace(/^0/, '')}`;
      const text = c.args.slice(1).join(' ');
      let url = `https://wa.me/${clean}`;
      if (text) url += `?text=${encodeURIComponent(text)}`;
      return c.reply(c.t('tools.link.ok', { url }));
    },
  },
  {
    id: 'calc', names: { he: ['מחשבון'], en: ['calc'] }, cat: 'tools', reaction: '🧮',
    async handler(c) {
      const expr = c.args.join(' ').trim();
      if (!expr) return c.reply(c.t('tools.calc.needExpr'));
      try {
        const clean = expr.replace(/[^-()\d/*+.% ]/g, '');
        if (!clean.trim()) throw new Error('empty');
        const result = Function(`"use strict"; return (${clean})`)();
        if (typeof result !== 'number' || !Number.isFinite(result)) throw new Error('bad');
        return c.reply(c.t('tools.calc.result', { result }));
      } catch {
        return c.reply(c.t('tools.calc.invalid'));
      }
    },
  },
  {
    id: 'dice', names: { he: ['קובייה'], en: ['dice'] }, cat: 'tools', reaction: '🎲',
    async handler(c) {
      return c.reply(c.t('tools.dice.result', { n: Math.floor(Math.random() * 6) + 1 }));
    },
  },
  {
    id: 'coin', names: { he: ['מטבע'], en: ['coin'] }, cat: 'tools', reaction: '🪙',
    async handler(c) {
      const side = Math.random() < 0.5 ? c.t('tools.coin.heads') : c.t('tools.coin.tails');
      return c.reply(c.t('tools.coin.result', { side }));
    },
  },
  {
    id: 'time', names: { he: ['שעה'], en: ['time'] }, cat: 'tools', reaction: '⏰',
    async handler(c) {
      const locale = lang() === 'he' ? 'he-IL' : 'en-US';
      return c.reply(c.t('tools.time.now', { time: new Date().toLocaleTimeString(locale) }));
    },
  },
  {
    id: 'date', names: { he: ['תאריך'], en: ['date'] }, cat: 'tools', reaction: '📅',
    async handler(c) {
      const locale = lang() === 'he' ? 'he-IL' : 'en-US';
      return c.reply(c.t('tools.date.today', { date: new Date().toLocaleDateString(locale) }));
    },
  },
  {
    id: 'reverse', names: { he: ['הפוך'], en: ['reverse'] }, cat: 'tools', reaction: '🔄',
    async handler(c) {
      const text = c.args.join(' ');
      if (!text) return c.reply(c.t('tools.reverse.needText'));
      return c.reply([...text].reverse().join(''));
    },
  },
  {
    id: 'tofile', names: { he: ['למי'], en: ['tofile'] }, cat: 'tools', reaction: '📁',
    async handler(c) {
      const target = c.quoted ? { key: c.quoted.key, message: c.quoted.message } : c.msg;
      if (!mediaKind({ message: target.message })) return c.reply(c.t('tools.tofile.needMedia'));
      await c.reply(c.t('tools.tofile.sending'));
      const buf = await downloadMediaMessage(target, 'buffer', {});
      const kind = mediaKind({ message: target.message });
      const mimetype =
        kind === 'image' ? 'image/jpeg' : kind === 'video' ? 'video/mp4' : kind === 'audio' ? 'audio/mpeg' : 'application/octet-stream';
      await c.sock.sendMessage(c.chatJid, { document: buf, mimetype, fileName: `file-${Date.now()}` });
    },
  },
  {
    id: 'help', names: { he: ['עזרה'], en: ['help'] }, cat: 'tools', reaction: '🚀',
    async handler(c) {
      const { commands } = require('./index');
      const sub = (c.args[0] || '').toLowerCase();
      const detailKeys = { antilink: 'antilink', repctl: 'repctl', tictactoe: 'tictactoe', groupperms: 'groupperms' };
      const byId = Object.fromEntries(commands.map((x) => [x.id, x]));
      if (sub) {
        const found = commands.find((x) => x.id === sub || Object.values(x.names).flat().includes(sub));
        if (found && detailKeys[found.id]) {
          return c.reply(c.t(`help.detail.${detailKeys[found.id]}`, { prefix: c.prefix }));
        }
        if (found) {
          const d = c.t(`help.cmd.${found.id}.d`);
          const u = c.t(`help.cmd.${found.id}.u`, { prefix: c.prefix });
          return c.reply(u === `[help.cmd.${found.id}.u]` ? `*${c.prefix}${found.names.en[0]}* - ${d}` : `*${d}*\n${u}`);
        }
      }
      const cats = ['ai', 'group', 'auth', 'fun', 'tools', 'owner'];
      let out = `${c.t('help.title')}\n\n${c.t('help.prefixNote', { prefix: c.prefix })}\n${c.t('help.detailHint', { prefix: c.prefix })}\n`;
      for (const cat of cats) {
        out += `\n*-- ${c.t(`help.categories.${cat}`)} --*\n`;
        for (const cmd of commands.filter((x) => x.cat === cat)) {
          out += `${cmd.reaction} \`${c.prefix}${cmd.names.en[0]}\` - ${c.t(`help.cmd.${cmd.id}.d`)}\n`;
        }
      }
      return c.reply(out);
    },
  },
];
