// Sticker creation via ffmpeg (image or short video -> webp).
// Needs ffmpeg on PATH (Termux: `pkg install ffmpeg`).
const { execFile } = require('child_process');
const fs = require('fs');
const path = require('path');
const cfg = require('./config');

if (!fs.existsSync(cfg.TEMP_DIR)) fs.mkdirSync(cfg.TEMP_DIR, { recursive: true });

function ffmpegExists() {
  return new Promise((resolve) => {
    execFile('ffmpeg', ['-version'], (err) => resolve(!err));
  });
}

function toWebp(inputPath) {
  const outPath = path.join(cfg.TEMP_DIR, `sticker-${Date.now()}.webp`);
  const args = [
    '-y', '-i', inputPath,
    '-vf', 'scale=512:512:force_original_aspect_ratio=decrease',
    '-vcodec', 'libwebp',
    '-lossless', '0', '-compression_level', '6', '-q:v', '60',
    '-loop', '0', '-preset', 'picture', '-an', '-vsync', '0',
    outPath,
  ];
  return new Promise((resolve, reject) => {
    execFile('ffmpeg', args, (err) => {
      if (err || !fs.existsSync(outPath)) return reject(err || new Error('webp not created'));
      resolve(outPath);
    });
  });
}

module.exports = { ffmpegExists, toWebp };
