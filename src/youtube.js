// YouTube search + audio download via yt-dlp.
// Binary path comes from YT_DLP_PATH (auto-detects the Termux path).
const fs = require('fs');
const path = require('path');
const yts = require('yt-search');
const YTDlpWrap = require('yt-dlp-wrap').default;
const cfg = require('./config');

if (!fs.existsSync(cfg.TEMP_DIR)) fs.mkdirSync(cfg.TEMP_DIR, { recursive: true });

const ytDlp = new YTDlpWrap(cfg.YT_DLP_PATH);

async function searchYouTube(query, limit = 10) {
  if (/^https?:\/\//.test(query)) {
    try {
      const info = await yts({ videoId: require('yt-search').getVideoID(query) });
      return [info].filter((v) => v && v.seconds > 0);
    } catch {
      return [];
    }
  }
  const { videos } = await yts(query);
  return (videos || []).slice(0, limit).filter((v) => v.seconds > 0);
}

// Downloads best audio and returns the file path.
async function downloadAudio(video) {
  const ext = cfg.YT_AUDIO_FORMAT === 'mp3' ? 'mp3' : 'opus';
  const filePath = path.join(cfg.TEMP_DIR, `${Date.now()}.${ext}`);
  const format = cfg.YT_AUDIO_FORMAT === 'mp3' ? 'mp3' : 'opus';
  await ytDlp.execPromise([
    video.url,
    '-f', 'bestaudio/best',
    '-x', '--audio-format', format,
    ...(format === 'mp3' ? ['--audio-quality', '0'] : []),
    '-o', filePath,
  ]);
  if (!fs.existsSync(filePath)) throw new Error('download produced no file');
  return filePath;
}

// Sends the downloaded file: voice note (opus PTT) or plain audio.
async function sendDownloadedAudio(sock, jid, filePath) {
  const buf = fs.readFileSync(filePath);
  try {
    if (cfg.YT_AUDIO_FORMAT === 'opus' && cfg.YT_VOICE_NOTE) {
      await sock.sendMessage(jid, { audio: buf, mimetype: 'audio/ogg; codecs=opus', ptt: true });
    } else {
      await sock.sendMessage(jid, { audio: buf, mimetype: 'audio/mpeg' });
    }
  } finally {
    try { fs.unlinkSync(filePath); } catch {}
  }
}

module.exports = { searchYouTube, downloadAudio, sendDownloadedAudio };
