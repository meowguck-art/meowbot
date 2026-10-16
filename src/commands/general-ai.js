// General commands: AI & creativity.
const ai = require('../ai');
const { lang } = require('../i18n');

module.exports = [
  {
    id: 'ask', names: { he: ['שאל'], en: ['ask'] }, cat: 'ai', reaction: '🧠',
    async handler(c) {
      const q = c.args.join(' ');
      if (!q) return c.reply(c.t('ai.ask.noQuestion', { prefix: c.prefix }));
      const answer = await ai.ask(q, lang());
      return c.reply(answer);
    },
  },
  {
    id: 'summarize', names: { he: ['סכם'], en: ['summarize'] }, cat: 'ai', reaction: '📑',
    async handler(c) {
      if (!c.quoted) return c.reply(c.t('ai.summarize.needQuote'));
      const text = (c.quoted.text || '').trim();
      if (!text) return c.reply(c.t('ai.summarize.noText'));
      const out = await ai.summarize(text, lang());
      return c.reply(out);
    },
  },
  {
    id: 'imagine', names: { he: ['דמיין'], en: ['imagine'] }, cat: 'ai', reaction: '🎨',
    async handler(c) {
      const prompt = c.args.join(' ');
      if (!prompt) return c.reply(c.t('ai.imagine.noPrompt', { prefix: c.prefix }));
      const out = await ai.imagine(prompt, lang());
      return c.reply(out);
    },
  },
  {
    id: 'translate', names: { he: ['תרגם'], en: ['translate'] }, cat: 'ai', reaction: '🌍',
    async handler(c) {
      const to = c.args[0];
      let text = c.args.slice(1).join(' ');
      if (c.quoted && !text) text = c.quoted.text;
      if (!to || !text) return c.reply(c.t('ai.translate.usage', { prefix: c.prefix }));
      const out = await ai.translateText(text, to);
      return c.reply(c.t('ai.translate.title', { lang: to, text: out }));
    },
  },
];
