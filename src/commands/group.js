// Group admin commands. Every command here additionally requires the
// sender to be a WhatsApp group admin (or the bot owner) - enforced
// by the router via gate: 'groupAdmin'.
const { db, getGroupSettings } = require('../db');
const { groupMetadataCached, userPart, mention, isBotAdmin, isGroupAdmin } = require('../utils');
const aliases = require('../lang/aliases');
const cfg = require('../config');

const jidOf = (part) => `${part}@s.whatsapp.net`;

function antilinkSettings(chatJid) {
  let s = db.data.antilink[chatJid];
  if (!s) {
    s = { enabled: false, mode: cfg.ANTILINK_DEFAULT_MODE, whitelist: [], blacklist: [] };
    db.data.antilink[chatJid] = s;
  }
  return s;
}

module.exports = [
  {
    id: 'addauth', names: { he: ['הוסףמורשה'], en: ['addauth'] }, cat: 'auth', reaction: '➕', gate: 'groupAdmin',
    async handler(c) {
      const gs = getGroupSettings(c.chatJid);
      if (!gs.admin_can_manage_perms && !c.isOwner) return c.reply(c.t('group.addauth.noPermManage'));
      const target = c.targetPart;
      if (!target) return c.reply(c.t('common.needTarget'));
      const exists = db.data.group_authorizations.find((a) => a.groupJid === c.chatJid && a.part === target);
      if (exists) return c.reply(c.t('group.addauth.already', { mention: mention(target) }));
      db.data.group_authorizations.push({ groupJid: c.chatJid, part: target });
      await db.write();
      return c.reply(c.t('group.addauth.ok', { mention: mention(target) }), { mentions: [jidOf(target)] });
    },
  },
  {
    id: 'removeauth', names: { he: ['הסרמורשה'], en: ['removeauth'] }, cat: 'auth', reaction: '➖', gate: 'groupAdmin',
    async handler(c) {
      const gs = getGroupSettings(c.chatJid);
      if (!gs.admin_can_manage_perms && !c.isOwner) return c.reply(c.t('group.addauth.noPermManage'));
      const target = c.targetPart;
      if (!target) return c.reply(c.t('common.needTarget'));
      db.data.group_authorizations = db.data.group_authorizations.filter(
        (a) => !(a.groupJid === c.chatJid && a.part === target));
      await db.write();
      return c.reply(c.t('group.removeauth.ok', { mention: mention(target) }), { mentions: [jidOf(target)] });
    },
  },
  {
    id: 'authlist', names: { he: ['רשימה'], en: ['authlist'] }, cat: 'auth', reaction: '📋', gate: 'groupAdmin',
    async handler(c) {
      const list = db.data.group_authorizations.filter((a) => a.groupJid === c.chatJid);
      let out = c.t('group.authlist.title', { count: list.length });
      if (list.length === 0) out += c.t('group.authlist.empty');
      else for (const a of list) out += c.t('group.authlist.row', { mention: mention(a.part) });
      const mentions = list.map((a) => jidOf(a.part));
      return c.reply(out, { mentions });
    },
  },
  {
    id: 'promote', names: { he: ['מנהל'], en: ['promote'] }, cat: 'group', reaction: '⬆️', gate: 'groupAdmin', needBotAdmin: true,
    async handler(c) {
      const target = c.targetPart;
      if (!target) return c.reply(c.t('common.needTarget'));
      await c.sock.groupParticipantsUpdate(c.chatJid, [jidOf(target)], 'promote');
      return c.reply(c.t('group.promote.ok', { mention: mention(target) }), { mentions: [jidOf(target)] });
    },
  },
  {
    id: 'demote', names: { he: ['הורד'], en: ['demote'] }, cat: 'group', reaction: '⬇️', gate: 'groupAdmin', needBotAdmin: true,
    async handler(c) {
      const target = c.targetPart;
      if (!target) return c.reply(c.t('common.needTarget'));
      await c.sock.groupParticipantsUpdate(c.chatJid, [jidOf(target)], 'demote');
      return c.reply(c.t('group.demote.ok', { mention: mention(target) }), { mentions: [jidOf(target)] });
    },
  },
  {
    id: 'kick', names: { he: ['הסר'], en: ['kick'] }, cat: 'group', reaction: '🚪', gate: 'groupAdmin', needBotAdmin: true,
    async handler(c) {
      const target = c.targetPart;
      if (!target) return c.reply(c.t('common.needTarget'));
      if (await isGroupAdmin(c.sock, c.chatJid, target)) return c.reply(c.t('group.kick.cantKickAdmin'));
      await c.sock.groupParticipantsUpdate(c.chatJid, [jidOf(target)], 'remove');
      return c.reply(c.t('group.kick.ok', { mention: mention(target) }), { mentions: [jidOf(target)] });
    },
  },
  {
    id: 'add', names: { he: ['הוסף'], en: ['add'] }, cat: 'group', reaction: '➕', gate: 'groupAdmin', needBotAdmin: true,
    async handler(c) {
      const num = (c.args[0] || '').replace(/[^0-9]/g, '');
      if (!num) return c.reply(c.t('group.add.needNumber'));
      const res = await c.sock.groupParticipantsUpdate(c.chatJid, [jidOf(num)], 'add');
      const ok = Object.values(res || {}).some((r) => r?.status === '200' || r?.invite_code || r?.code === 200);
      return c.reply(c.t(ok ? 'group.add.ok' : 'group.add.fail'));
    },
  },
  {
    id: 'grouplink', names: { he: ['קישור'], en: ['grouplink'] }, cat: 'group', reaction: '🔗', gate: 'groupAdmin', needBotAdmin: true,
    async handler(c) {
      const code = await c.sock.groupInviteCode(c.chatJid);
      return c.reply(c.t('group.grouplink.title', { url: `https://chat.whatsapp.com/${code}` }));
    },
  },
  {
    id: 'tagall', names: { he: ['תייגאתכולם'], en: ['tagall'] }, cat: 'group', reaction: '📢', gate: 'groupAdmin',
    async handler(c) {
      const meta = await groupMetadataCached(c.sock, c.chatJid);
      const text = c.args.join(' ') || c.t('group.tagall.defaultText');
      const mentions = meta.participants.map((p) => p.id);
      return c.reply(text, { mentions });
    },
  },
  {
    id: 'admins', names: { he: ['מנהלים'], en: ['admins'] }, cat: 'group', reaction: '👨‍💼', gate: 'groupAdmin',
    async handler(c) {
      const meta = await groupMetadataCached(c.sock, c.chatJid);
      let out = c.t('group.admins.title');
      const mentions = [];
      for (const p of meta.participants.filter((x) => x.admin)) {
        out += c.t('group.admins.row', { mention: mention(userPart(p.id)) });
        mentions.push(p.id);
      }
      return c.reply(out, { mentions });
    },
  },
  {
    id: 'setsubject', names: { he: ['שםקבוצה'], en: ['setsubject'] }, cat: 'group', reaction: '✏️', gate: 'groupAdmin', needBotAdmin: true,
    async handler(c) {
      const subject = c.args.join(' ').trim();
      if (!subject) return c.reply(c.t('group.setsubject.needText'));
      await c.sock.groupUpdateSubject(c.chatJid, subject);
      return c.reply(c.t('group.setsubject.ok'));
    },
  },
  {
    id: 'setdesc', names: { he: ['תיאור'], en: ['setdesc'] }, cat: 'group', reaction: '🗒️', gate: 'groupAdmin', needBotAdmin: true,
    async handler(c) {
      const desc = c.args.join(' ').trim();
      if (!desc) return c.reply(c.t('group.setdesc.needText'));
      await c.sock.groupUpdateDescription(c.chatJid, desc);
      return c.reply(c.t('group.setdesc.ok'));
    },
  },
  {
    id: 'groupinfo', names: { he: ['מידעקבוצה'], en: ['groupinfo'] }, cat: 'group', reaction: 'ℹ️', gate: 'groupAdmin',
    async handler(c) {
      const meta = await groupMetadataCached(c.sock, c.chatJid);
      const created = new Date((meta.creation || 0) * 1000).toLocaleDateString();
      const owner = meta.owner ? mention(userPart(meta.owner)) : c.t('group.groupinfo.unknown');
      return c.reply(c.t('group.groupinfo.card', {
        name: meta.subject || '', created, owner, count: meta.participants.length,
      }));
    },
  },
  {
    id: 'warn', names: { he: ['אזהרה'], en: ['warn'] }, cat: 'group', reaction: '⚠️', gate: 'groupAdmin',
    async handler(c) {
      const target = c.targetPart;
      if (!target) return c.reply(c.t('common.needTarget'));
      const key = `${c.chatJid}:${target}`;
      const count = (db.data.warnings[key] || 0) + 1;
      db.data.warnings[key] = count;
      await db.write();
      await c.reply(c.t('group.warn.warned', { mention: mention(target), count }), { mentions: [jidOf(target)] });
      if (count >= cfg.WARN_LIMIT && await isBotAdmin(c.sock, c.chatJid)) {
        if (await isGroupAdmin(c.sock, c.chatJid, target)) return;
        await c.sock.groupParticipantsUpdate(c.chatJid, [jidOf(target)], 'remove');
        delete db.data.warnings[key];
        await db.write();
        await c.reply(c.t('group.warn.kicked', { mention: mention(target), limit: cfg.WARN_LIMIT }), { mentions: [jidOf(target)] });
      }
    },
  },
  {
    id: 'resetwarns', names: { he: ['אפסאזהרות'], en: ['resetwarns'] }, cat: 'group', reaction: '✅', gate: 'groupAdmin',
    async handler(c) {
      const target = c.targetPart;
      if (!target) return c.reply(c.t('common.needTarget'));
      const key = `${c.chatJid}:${target}`;
      if (db.data.warnings[key]) {
        delete db.data.warnings[key];
        await db.write();
        return c.reply(c.t('group.resetwarns.ok', { mention: mention(target) }), { mentions: [jidOf(target)] });
      }
      return c.reply(c.t('group.resetwarns.none', { mention: mention(target) }), { mentions: [jidOf(target)] });
    },
  },
  {
    id: 'closegroup', names: { he: ['סגורקבוצה'], en: ['closegroup'] }, cat: 'group', reaction: '🔒', gate: 'groupAdmin', needBotAdmin: true,
    async handler(c) {
      await c.sock.groupSettingUpdate(c.chatJid, 'announcement');
      return c.reply(c.t('group.closegroup.ok'));
    },
  },
  {
    id: 'opengroup', names: { he: ['פתחקבוצה'], en: ['opengroup'] }, cat: 'group', reaction: '🔓', gate: 'groupAdmin', needBotAdmin: true,
    async handler(c) {
      await c.sock.groupSettingUpdate(c.chatJid, 'not_announcement');
      return c.reply(c.t('group.opengroup.ok'));
    },
  },
  {
    id: 'antilink', names: { he: ['אנטילינק'], en: ['antilink'] }, cat: 'group', reaction: '🛡️', gate: 'groupAdmin',
    async handler(c) {
      const s = antilinkSettings(c.chatJid);
      const sub = (c.args[0] || '').toLowerCase();
      const rest = c.args.slice(1).join(' ').trim();
      if (aliases.matches(aliases.on, sub)) {
        const mode = rest || cfg.ANTILINK_DEFAULT_MODE;
        if (!['delete_kick', 'delete_only', 'warn_delete'].includes(mode)) {
          return c.reply(c.t('group.antilink.invalidMode'));
        }
        s.enabled = true; s.mode = mode;
        await db.write();
        return c.reply(c.t('group.antilink.on', { mode }));
      }
      if (aliases.matches(aliases.off, sub)) {
        s.enabled = false;
        await db.write();
        return c.reply(c.t('group.antilink.off'));
      }
      if (aliases.matches(aliases.block, sub)) {
        if (!rest) return c.reply(c.t('group.antilink.usage', { prefix: c.prefix }));
        if (!s.blacklist.includes(rest)) s.blacklist.push(rest);
        await db.write();
        return c.reply(c.t('group.antilink.blocked', { domain: rest }));
      }
      if (aliases.matches(aliases.allow, sub)) {
        if (!rest) return c.reply(c.t('group.antilink.usage', { prefix: c.prefix }));
        if (!s.whitelist.includes(rest)) s.whitelist.push(rest);
        await db.write();
        return c.reply(c.t('group.antilink.allowed', { link: rest }));
      }
      if (aliases.matches(aliases.status, sub) || !sub) {
        const fmt = (arr) => (arr.length ? arr.join(', ') : c.t('group.antilink.listEmpty'));
        return c.reply(c.t('group.antilink.status', {
          state: s.enabled ? c.t('group.antilink.stateOn') : c.t('group.antilink.stateOff'),
          mode: s.mode,
          blacklist: fmt(s.blacklist),
          whitelist: fmt(s.whitelist),
        }));
      }
      return c.reply(c.t('group.antilink.usage', { prefix: c.prefix }));
    },
  },
  {
    // The reputation control panel - the original bot only had help text
    // for this command; here it is fully implemented.
    id: 'repctl', names: { he: ['הוקרה'], en: ['repctl'] }, cat: 'group', reaction: '⚙️', gate: 'groupAdmin',
    async handler(c) {
      const gs = getGroupSettings(c.chatJid);
      const sub = (c.args[0] || '').toLowerCase();
      const rest = c.args.slice(1).join(' ').trim().toLowerCase();
      if (aliases.matches(aliases.on, sub)) {
        gs.rep_enabled = true;
        await db.write();
        return c.reply(c.t('group.repctl.on'));
      }
      if (aliases.matches(aliases.off, sub)) {
        gs.rep_enabled = false;
        await db.write();
        return c.reply(c.t('group.repctl.off'));
      }
      if (aliases.matches(aliases.perm, sub)) {
        if (aliases.matches(aliases.permEveryone, rest)) gs.rep_permission = 'everyone';
        else if (aliases.matches(aliases.permAuthorized, rest)) gs.rep_permission = 'authorized';
        else return c.reply(c.t('group.repctl.invalidPerm'));
        await db.write();
        const who = gs.rep_permission === 'everyone'
          ? c.t('group.repctl.permEveryone') : c.t('group.repctl.permAuthorized');
        return c.reply(c.t('group.repctl.permSet', { who }));
      }
      if (aliases.matches(aliases.status, sub) || !sub) {
        const who = gs.rep_permission === 'everyone'
          ? c.t('group.repctl.permEveryone') : c.t('group.repctl.permAuthorized');
        return c.reply(c.t('group.repctl.status', {
          state: gs.rep_enabled ? c.t('group.repctl.stateOn') : c.t('group.repctl.stateOff'),
          who,
        }));
      }
      return c.reply(c.t('group.repctl.usage', { prefix: c.prefix }));
    },
  },
];
