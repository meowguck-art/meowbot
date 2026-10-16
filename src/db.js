// LowDB JSON database. One file, six collections.
// users: [{ part, name, reputation, is_global_authorized }]
// reminders: [{ chatJid, message, trigger_at }]
// group_settings: [{ chatJid, rep_enabled, rep_permission, admin_can_manage_perms }]
// group_authorizations: [{ groupJid, part }]
// antilink: { [chatJid]: { enabled, mode, whitelist[], blacklist[] } }
// warnings: { "chatJid:part": count }  (persisted - survives restarts)
const { Low } = require('lowdb');
const { JSONFile } = require('lowdb/node');
const cfg = require('./config');

const defaultData = {
  users: [],
  reminders: [],
  group_settings: [],
  group_authorizations: [],
  antilink: {},
  warnings: {},
};

const adapter = new JSONFile(cfg.DB_FILE);
const db = new Low(adapter, defaultData);

async function init() {
  await db.read();
  db.data = db.data || {};
  for (const k of Object.keys(defaultData)) {
    if (db.data[k] === undefined) db.data[k] = defaultData[k];
  }
  for (const part of cfg.OWNER_PARTS) {
    let u = db.data.users.find((x) => x.part === part);
    if (!u) db.data.users.push({ part, name: 'Owner', reputation: 999, is_global_authorized: true });
    else if (!u.is_global_authorized) u.is_global_authorized = true;
  }
  await db.write();
  console.log('[MeowBot] database ready');
}

function getUser(part) {
  let u = db.data.users.find((x) => x.part === part);
  if (!u) {
    u = { part, name: part, reputation: 0, is_global_authorized: false };
    db.data.users.push(u);
  }
  return u;
}

function getGroupSettings(chatJid) {
  let s = db.data.group_settings.find((x) => x.chatJid === chatJid);
  if (!s) {
    s = { chatJid, rep_enabled: false, rep_permission: 'everyone', admin_can_manage_perms: false };
    db.data.group_settings.push(s);
  }
  return s;
}

module.exports = { db, init, getUser, getGroupSettings };
