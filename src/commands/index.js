// Command registry: assembles every command module and builds the
// name -> command lookup (Hebrew and English names, case-insensitive).
const generalAi = require('./general-ai');
const generalTools = require('./general-tools');
const generalFun = require('./general-fun');
const generalMedia = require('./general-media');
const group = require('./group');
const owner = require('./owner');

const commands = [
  ...generalAi,
  ...generalTools,
  ...generalFun,
  ...generalMedia,
  ...group,
  ...owner,
];

const byName = new Map();
for (const cmd of commands) {
  for (const n of [...(cmd.names.he || []), ...(cmd.names.en || [])]) {
    byName.set(n.toLowerCase(), cmd);
  }
}

function findCommand(name) {
  return byName.get(String(name || '').toLowerCase()) || null;
}

module.exports = { commands, findCommand };
module.exports.handleYoutubeMenuPick = generalMedia.handleYoutubeMenuPick;
