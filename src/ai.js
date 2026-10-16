// Gemini AI helpers. Model id comes from GEMINI_MODEL in .env -
// swap it without touching code.
const cfg = require('./config');
const { t } = require('./i18n');

let model = null;
function getModel() {
  if (model) return model;
  if (!cfg.GEMINI_API_KEY) throw new Error('GEMINI_API_KEY is not set');
  const { GoogleGenerativeAI } = require('@google/generative-ai');
  const genAI = new GoogleGenerativeAI(cfg.GEMINI_API_KEY);
  model = genAI.getGenerativeModel({ model: cfg.GEMINI_MODEL });
  return model;
}

async function ask(question, lang) {
  const m = getModel();
  const prompt =
    `You are a friendly and helpful WhatsApp bot named '${cfg.AI_NAME}'. ` +
    `Answer the user's question directly and conversationally in ${lang === 'he' ? 'Hebrew' : 'English'}. ` +
    `The user's question is: "${question}"`;
  const res = await m.generateContent(prompt);
  return res.response.text();
}

async function summarize(text, lang) {
  const m = getModel();
  const target = lang === 'he' ? 'Hebrew' : 'English';
  const res = await m.generateContent(`Summarize the following text in ${target}:\n\n"${text}"`);
  return t('ai.summarize.title', { text: res.response.text() });
}

async function imagine(description, lang) {
  const m = getModel();
  const res = await m.generateContent(`Describe a photorealistic image of: ${description}`);
  return t('ai.imagine.title', { text: res.response.text() });
}

async function translateText(text, to) {
  const translate = require('@vitalets/google-translate-api').default || require('@vitalets/google-translate-api');
  const { text: out } = await translate(text, { to });
  return out;
}

module.exports = { ask, summarize, imagine, translateText };
