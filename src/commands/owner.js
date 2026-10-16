// Owner-only commands. Gate 'owner' is enforced by the router.
const { db, getGroupSettings } = require('../db');
const cfg = require('../config');
const aliases = require('../lang/aliases');
const { groupMetadataCached, userPart, mention, isBotAdmin } = require('../utils');

const jidOf = (part) => `${part}@s.whatsapp.net`;

module.exports = [
  {
    id: 'status', names: { he: ['סטטוס'], en: ['status'] }, cat: 'owner', reaction: '📊', gate: 'owner',
    async handler(c) {
      const s = Math.floor(process.uptime());
      const uptime = `${Math.floor(s / 3600)}h ${Math.floor((s % 3600) / 60)}m ${s % 60}s`;
      return c.reply(c.t('owner.status.card', { mode: cfg.BOT_MODE, lang: cfg.BOT_LANG, uptime }));
    },
  },
  {
    id: 'owner', names: { he: ['בעלים'], en: ['owner'] }, cat: 'owner', reaction: '👑', gate: 'owner',
    async handler(c) {
      const first = cfg.OWNER_PARTS[0] || '?';
      return c.reply(c.t('owner.owner.text', { mention: mention(first) }), { mentions: [jidOf(first)] });
    },
  },
  {
    id: 'version', names: { he: ['גרסה'], en: ['version'] }, cat: 'owner', reaction: '©️', gate: 'owner',
    async handler(c) {
      return c.reply(c.t('owner.version.card'));
    },
  },
  {
    id: 'setmode', names: { he: ['שנהמצב'], en: ['setmode'] }, cat: 'owner', reaction: '🔧', gate: 'owner',
    async handler(c) {
      const mode = (c.args[0] || '').toLowerCase();
      if (!['self', 'authorized', 'public'].includes(mode)) {
        return c.reply(c.t('owner.setmode.invalid'));
      }
      cfg.BOT_MODE = mode;
      return c.reply(c.t('owner.setmode.ok', { mode }));
    },
  },
  {
    id: 'leave', names: { he: ['עזוב'], en: ['leave'] }, cat: 'owner', reaction: '👋', gate: 'owner',
    async handler(c) {
      if (!c.isGroup) return c.reply(c.t('common.groupOnly'));
      await c.reply(c.t('owner.leave.bye'));
      await c.sock.groupLeave(c.chatJid);
    },
  },
  {
    id: 'nuke', names: { he: ['פצצה'], en: ['nuke'] }, cat: 'owner', reaction: '💣', gate: 'owner',
    async handler(c) {
      if (!c.isGroup) return c.reply(c.t('common.groupOnly'));
      if (!(await isBotAdmin(c.sock, c.chatJid))) return c.reply(c.t('common.needBotAdmin'));
      await c.reply(c.t('owner.nuke.start'));
      const botPart = userPart(c.sock.user?.id);
      const meta = await groupMetadataCached(c.sock, c.chatJid);
      const victims = meta.participants
        .filter((p) => !p.admin && userPart(p.id) !== botPart)
        .map((p) => p.id);
      if (victims.length === 0) return c.reply(c.t('owner.nuke.none'));
      await c.sock.groupParticipantsUpdate(c.chatJid, victims, 'remove');
      return c.reply(c.t('owner.nuke.done'));
    },
  },
  {
    id: 'addglobalauth', names: { he: ['הוסףמורשהגלובלי'], en: ['addglobalauth'] }, cat: 'owner', reaction: '🎖️', gate: 'owner',
    async handler(c) {
      const target = c.targetPart;
      if (!target) return c.reply(c.t('common.needTarget'));
      let u = db.data.users.find((x) => x.part === target);
      if (!u) {
        u = { part: target, name: target, reputation: 0, is_global_authorized: true };
        db.data.users.push(u);
      } else u.is_global_authorized = true;
      await db.write();
      return c.reply(c.t('owner.addglobalauth.ok', { mention: mention(target) }), { mentions: [jidOf(target)] });
    },
  },
  {
    id: 'removeglobalauth', names: { he: ['הסרמורשהגלובלי'], en: ['removeglobalauth'] }, cat: 'owner', reaction: '🎖️', gate: 'owner',
    async handler(c) {
      const target = c.targetPart;
      if (!target) return c.reply(c.t('common.needTarget'));
      if (cfg.OWNER_PARTS.includes(target)) return c.reply(c.t('owner.removeglobalauth.cantRemoveOwner'));
      const u = db.data.users.find((x) => x.part === target);
      if (u) { u.is_global_authorized = false; await db.write(); }
      return c.reply(c.t('owner.removeglobalauth.ok', { mention: mention(target) }), { mentions: [jidOf(target)] });
    },
  },
  {
    id: 'globallist', names: { he: ['רשימהגלובלית'], en: ['globallist'] }, cat: 'owner', reaction: '📋', gate: 'owner',
    async handler(c) {
      const list = db.data.users.filter((u) => u.is_global_authorized);
      let out = c.t('owner.globallist.title', { count: list.length });
      for (const u of list) out += c.t('owner.globallist.row', { name: u.name || u.part, mention: mention(u.part) });
      return c.reply(out, { mentions: list.map((u) => jidOf(u.part)) });
    },
  },
  {
    id: 'groupperms', names: { he: ['הרשאותקבוצה'], en: ['groupperms'] }, cat: 'owner', reaction: '🔐', gate: 'owner',
    async handler(c) {
      if (!c.isGroup) return c.reply(c.t('common.groupOnly'));
      const opt = (c.args[0] || '').toLowerCase();
      let allow = null;
      if (aliases.matches(aliases.grouppermsAllow, opt)) allow = true;
      else if (aliases.matches(aliases.grouppermsDeny, opt)) allow = false;
      if (allow === null) return c.reply(c.t('owner.groupperms.invalidOption', { prefix: c.prefix }));
      const gs = getGroupSettings(c.chatJid);
      gs.admin_can_manage_perms = allow;
      await db.write();
      const what = allow ? c.t('owner.groupperms.can') : c.t('owner.groupperms.cannot');
      return c.reply(c.t('owner.groupperms.ok', { what }));
    },
  },
];
