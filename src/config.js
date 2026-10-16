// Central configuration. Every value comes from the environment (.env).
// Nothing secret is hardcoded anywhere in the codebase.
require('dotenv').config();
const fs = require('fs');

const toBool = (v, d) => (v === undefined || v === '' ? d : ['1', 'true', 'yes', 'on'].includes(String(v).toLowerCase()));
const toInt = (v, d) => {
  const n = parseInt(v, 10);
  return Number.isFinite(n) ? n : d;
};
const digits = (s) => String(s || '').replace(/[^0-9]/g, '');
const numToJid = (n) => `${digits(n)}@s.whatsapp.net`;
const userPart = (n) => digits(n);

function resolveYtDlp() {
  if (process.env.YT_DLP_PATH) return process.env.YT_DLP_PATH;
  const termux = '/data/data/com.termux/files/usr/bin/yt-dlp';
  if (fs.existsSync(termux)) return termux;
  return 'yt-dlp'; // fall back to PATH
}

const BOT_LANG = String(process.env.BOT_LANG || 'he').toLowerCase();
const BOT_MODE = String(process.env.BOT_MODE || 'authorized').toLowerCase();

module.exports = {
  BOT_NUMBER: digits(process.env.BOT_NUMBER),
  OWNER_JIDS: String(process.env.OWNER_NUMBERS || '')
    .split(',')
    .map((s) => s.trim())
    .filter(Boolean)
    .map(numToJid),
  OWNER_PARTS: String(process.env.OWNER_NUMBERS || '')
    .split(',')
    .map((s) => s.trim())
    .filter(Boolean)
    .map(userPart),

  PREFIX: process.env.PREFIX || '!',
  BOT_LANG: BOT_LANG === 'en' ? 'en' : 'he',
  BOT_MODE: ['self', 'authorized', 'public'].includes(BOT_MODE) ? BOT_MODE : 'authorized',

  GEMINI_API_KEY: process.env.GEMINI_API_KEY || '',
  GEMINI_MODEL: process.env.GEMINI_MODEL || 'gemini-1.5-flash',
  AI_NAME: process.env.AI_NAME || 'MeowBot',

  REACTIONS_ENABLED: toBool(process.env.REACTIONS_ENABLED, true),
  COOLDOWN_SECONDS: toInt(process.env.COOLDOWN_SECONDS, 5),
  WARN_LIMIT: toInt(process.env.WARN_LIMIT, 3),

  ANTI_DELETE: toBool(process.env.ANTI_DELETE, true),
  ANTI_DELETE_MEDIA: toBool(process.env.ANTI_DELETE_MEDIA, true),
  SAVE_VIEW_ONCE: toBool(process.env.SAVE_VIEW_ONCE, true),

  ANTILINK_DEFAULT_MODE: process.env.ANTILINK_DEFAULT_MODE || 'delete_only',

  YT_DLP_PATH: resolveYtDlp(),
  YT_AUDIO_FORMAT: String(process.env.YT_AUDIO_FORMAT || 'opus').toLowerCase() === 'mp3' ? 'mp3' : 'opus',
  YT_VOICE_NOTE: toBool(process.env.YT_VOICE_NOTE, true),

  STICKER_AUTHOR: process.env.STICKER_AUTHOR || 'MeowBot',
  STICKER_PACK: process.env.STICKER_PACK || 'MeowBot',

  AUTH_DIR: process.env.AUTH_DIR || './auth',
  DB_FILE: process.env.DB_FILE || './data.json',
  TEMP_DIR: process.env.TEMP_DIR || './temp',

  numToJid,
  userPart,
};
