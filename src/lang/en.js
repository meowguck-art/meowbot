// English strings. Mirrors src/lang/he.js key-for-key.
// Placeholders look like {name} and are filled by the caller.
// RULE: not a single Hebrew character may appear in this file -
// `npm run audit` enforces it automatically.
module.exports = {
  common: {
    ownerOnly: '🔒 This command is for the bot owner only.',
    groupOnly: 'This command only works in groups.',
    needBotAdmin: 'I need to be a group admin to do that.',
    needGroupAdmin: 'Only group admins can use this command.',
    needTarget: 'Tag a user or reply to their message.',
    needText: 'You need to provide some text.',
    needNumber: 'You need to provide a phone number.',
    needMedia: 'Send media or reply to a message with media.',
    invalidOption: 'Invalid option.',
    invalidNumber: 'Invalid number.',
    error: '❌ Oops, something went wrong.',
  },

  help: {
    title: '🚀 *Bot command menu* 🚀',
    prefixNote: '*The command prefix is:* `{prefix}`',
    detailHint: '*For detailed help, type {prefix}help [command name]*',
    categories: {
      ai: '🧠 AI & creativity',
      group: '👑 Group management',
      auth: '🛡️ Authorized users',
      fun: '⭐ Community & games',
      tools: '🛠️ General & useful',
      owner: '⚙️ Owner-only commands',
    },
    detail: {
      antilink:
        '*Help for {prefix}antilink:*\nProtection against unwanted links.\n\n' +
        '*Subcommands (admins only):*\n' +
        '• `{prefix}antilink on [mode]` - enables protection.\n' +
        '  Modes: `delete_kick` (delete + kick), `delete_only` (delete only), `warn_delete` (warn + delete).\n' +
        '• `{prefix}antilink off` - disables protection.\n' +
        '• `{prefix}antilink block [domain]` - add a domain to the blacklist (e.g. `t.me`).\n' +
        '• `{prefix}antilink allow [link]` - add a link to the whitelist.\n' +
        '• `{prefix}antilink status` - show current settings.',
      repctl:
        '*Help for {prefix}rep:*\nReputation system management for the group.\n\n' +
        '*Subcommands (admins only):*\n' +
        '• `{prefix}rep on` - enables the system in this group.\n' +
        '• `{prefix}rep off` - disables the system in this group.\n' +
        '• `{prefix}rep perm [everyone/authorized]` - who can award points.\n' +
        '• `{prefix}rep status` - show current settings.',
      tictactoe:
        '*Help for {prefix}tictactoe:*\nPlay tic-tac-toe against the bot or a friend.\n\n' +
        '*Subcommands:*\n' +
        '• `{prefix}tictactoe start` - start a game vs the bot.\n' +
        '• `{prefix}tictactoe start [@tag]` - start a game vs a friend.\n' +
        '• `{prefix}tictactoe move [1-9]` or just `{prefix}[number]` - make a move.\n' +
        '• `{prefix}tictactoe cancel` - cancel the current game.',
      groupperms:
        '*Help for {prefix}groupperms (owner only):*\nControl whether group admins may manage authorized users.\n\n' +
        '*Usage:*\n' +
        '• `{prefix}groupperms allow` - let this group\u2019s admins use the auth commands.\n' +
        '• `{prefix}groupperms deny` - take that ability away.',
    },
    cmd: {
      help:        { d: 'Show the command menu', u: '{prefix}help [command name]' },
      ask:         { d: 'Ask the AI anything', u: '{prefix}ask [question]' },
      summarize:   { d: 'Summarize a long text (reply to a message)', u: '{prefix}summarize' },
      imagine:     { d: 'Describe an image in words from a prompt', u: '{prefix}imagine [description]' },
      translate:   { d: 'Translate text to another language', u: '{prefix}translate [lang code] [text]' },
      remind:      { d: 'Set a reminder', u: '{prefix}remind [time] [unit] [message]' },
      youtube:     { d: 'Download audio from YouTube', u: '{prefix}yt [song name or link]' },
      sticker:     { d: 'Turn a photo/video into a sticker', u: '{prefix}sticker' },
      ping:        { d: 'Check response speed' },
      del:         { d: 'Delete a bot message (quote it)' },
      me:          { d: 'Show your details' },
      getpp:       { d: 'Get a user\u2019s profile picture' },
      wiki:        { d: 'Look up a term on Wikipedia', u: '{prefix}wiki [term]' },
      joke:        { d: 'Get a random joke' },
      quote:       { d: 'Get an inspiring quote' },
      search:      { d: 'Search Google', u: '{prefix}search [query]' },
      shorten:     { d: 'Shorten a link', u: '{prefix}shorten [link]' },
      link:        { d: 'Create a direct WhatsApp link to a number', u: '{prefix}link [number] [text]' },
      calc:        { d: 'Solve a math expression', u: '{prefix}calc [expression]' },
      dice:        { d: 'Roll a dice' },
      coin:        { d: 'Flip a coin' },
      time:        { d: 'Show the current time' },
      date:        { d: 'Show today\u2019s date' },
      reverse:     { d: 'Reverse text', u: '{prefix}reverse [text]' },
      tofile:      { d: 'Send media as a document file' },
      thanks:      { d: 'Award a reputation point (reply to a message)' },
      rep:         { d: 'Check your (or someone\u2019s) reputation' },
      top5:        { d: 'Show the reputation leaders' },
      trivia:      { d: 'Start a trivia game' },
      tictactoe:   { d: 'Play tic-tac-toe', u: '{prefix}tictactoe [start/move/cancel]' },
      addauth:     { d: 'Add an authorized user to this group' },
      removeauth:  { d: 'Remove an authorized user from this group' },
      authlist:    { d: 'List authorized users in this group' },
      promote:     { d: 'Promote a user to admin' },
      demote:      { d: 'Demote an admin' },
      kick:        { d: 'Remove a user from the group' },
      add:         { d: 'Add a participant to the group', u: '{prefix}add [number]' },
      grouplink:   { d: 'Get the group invite link' },
      tagall:      { d: 'Tag all group members', u: '{prefix}tagall [text]' },
      admins:      { d: 'Show the admin list' },
      setsubject:  { d: 'Change the group name', u: '{prefix}setsubject [name]' },
      setdesc:     { d: 'Change the group description', u: '{prefix}setdesc [description]' },
      groupinfo:   { d: 'Get info about the group' },
      warn:        { d: 'Warn a user' },
      resetwarns:  { d: 'Reset a user\u2019s warnings' },
      closegroup:  { d: 'Close the group to admins only' },
      opengroup:   { d: 'Open the group to everyone' },
      antilink:    { d: 'Link-protection settings', u: '{prefix}antilink [on/off/block/allow/status]' },
      repctl:      { d: 'Manage the reputation system', u: '{prefix}rep [on/off/perm/status]' },
      status:      { d: 'Show bot status' },
      owner:       { d: 'Show the bot owner' },
      version:     { d: 'Show the bot version' },
      setmode:     { d: 'Change operation mode', u: '{prefix}setmode [self/authorized/public]' },
      leave:       { d: 'Make the bot leave the group' },
      nuke:        { d: 'Remove everyone who is not an admin' },
      addglobalauth:    { d: 'Add a globally authorized user' },
      removeglobalauth: { d: 'Remove a globally authorized user' },
      globallist:  { d: 'List globally authorized users' },
      groupperms:  { d: 'Control whether admins may manage auth', u: '{prefix}groupperms [allow/deny]' },
    },
  },

  ai: {
    ask: {
      noQuestion: 'You need to provide a question.\nUsage: `{prefix}ask [question]`',
    },
    summarize: {
      needQuote: 'Reply to a long message to summarize it.',
      noText: 'The quoted message contains no text.',
      title: '*📑 Summary:*\n\n{text}',
    },
    imagine: {
      noPrompt: 'You need to provide an image description.\nUsage: `{prefix}imagine [description]`',
      title: '*🎨 Image description I created for you:*\n\n{text}',
    },
    translate: {
      usage: 'Usage: `{prefix}translate [lang code] [text]`\nExample: `{prefix}translate he hello world`',
      title: '*🌍 Translation to {lang}:*\n{text}',
    },
  },

  media: {
    youtube: {
      noQuery: 'You need to provide a song name or link.\nUsage: `{prefix}yt [search]`',
      searching: '🔎 Searching YouTube for "{query}"...',
      resultsTitle: '*🔍 Search results for "{query}":*\n',
      replyNumber: '\n*Reply with the number of the song you want.*',
      invalidNumber: 'Invalid number. Try again.',
      downloading: '🎬 Downloading *"{title}"*...',
      failed: '❌ Oops, the download failed.',
      error: '❌ Oops, an error occurred during the download.',
      menuTitle: '🎵 *Search results for "{query}"*',
      menuButton: 'Pick a song 🎵',
      menuFooter: 'Tapping a song starts the download right away',
      sectionTitle: 'Songs found',
      expired: '❌ This menu expired, search again.',
    },
    sticker: {
      needMedia: 'Send a photo/video with the command, or reply to a message with media.',
      making: 'Making your sticker... 🖼️',
      badType: '❌ The file is not a supported image or video.',
      noFfmpeg: '❌ ffmpeg was not found on this device - cannot create stickers.',
    },
    remind: {
      usage: 'Usage: `{prefix}remind [time] [unit] [message]`\nUnits: minutes, hours, days.\nExample: `{prefix}remind 10 minutes call mom`',
      invalidUnit: 'Invalid time unit. Options: minutes, hours, days.',
      ok: '✅ Got it, I will remind you in {time} {unit}.',
    },
  },

  tools: {
    ping: { pong: '*Pong!* 🏓\n_Response time:_ {ms}ms' },
    del: {
      needQuote: 'Quote a bot message to delete it.',
      notMine: 'I can only delete messages I sent myself.',
    },
    me: {
      card: '*Your details*\n*Name:* {name}\n*Number:* {number}\n*About:* {about}',
    },
    getpp: {
      caption: 'Profile picture of {mention}',
      none: '{mention} has no profile picture.',
    },
    wiki: {
      needTerm: 'You need to provide a search term.\nUsage: `{prefix}wiki [term]`',
    },
    search: {
      needQuery: 'You need to provide search terms.',
      title: '*Search results for "{query}":*\n{url}',
    },
    shorten: {
      needUrl: 'You need to provide a valid link to shorten.',
      ok: '✅ Shortened link:\n{url}',
    },
    link: {
      needNumber: 'You need to provide a phone number.',
      ok: '✅ Your direct WhatsApp link is ready:\n{url}',
    },
    calc: {
      needExpr: 'You need to provide an expression to calculate.',
      result: '🧮 Result: {result}',
      invalid: 'Invalid expression.',
    },
    dice: { result: '🎲 Result: {n}' },
    coin: { heads: 'heads', tails: 'tails', result: '🪙 Result: {side}' },
    time: { now: 'The time is: {time}' },
    date: { today: 'Today\u2019s date: {date}' },
    reverse: { needText: 'You need to provide text to reverse.' },
    tofile: {
      needMedia: 'Reply to a message with media to send it as a file.',
      sending: 'Forwarding the file...',
    },
  },

  fun: {
    thanks: {
      disabled: 'The reputation system is off in this group. An admin can enable it with `{prefix}rep on`.',
      noPerm: 'You are not allowed to award points in this group.',
      needQuote: 'Reply to the message of the user you want to thank.',
      selfThanks: 'You cannot thank yourself!',
      ok: '{name} received a reputation point! ⭐',
    },
    rep: {
      title: '*⭐ {name}\u2019s reputation: {count}*',
    },
    top5: {
      title: '🏆 *Top 5 reputation leaders:* 🏆\n',
      empty: 'No reputation data yet.',
      row: '{i}. *{name}* - {count}⭐\n',
    },
    trivia: {
      busy: 'There is already an active game in this chat.',
      title: '*❓ Trivia question!*\n\n{question}\n',
      sendAnswer: '\n*Send the full answer!*',
      win: '🎉 Correct answer, {mention}! You earned 5 reputation points!',
    },
    tictactoe: {
      usage: 'Correct usage: `{prefix}tictactoe [start/move/cancel]`',
      busy: 'There is already an active game in this chat.',
      noPrivateOpponent: 'You cannot play against another user in a private chat.',
      start: '⭕ *Tic-tac-toe!* ❌\n{px} (❌) vs {po} (⭕)\n\n{px} starts.\n{board}',
      botName: 'the bot',
      noGame: 'No active game. Start one with `{prefix}tictactoe start`.',
      notYourTurn: 'It is not your turn!',
      invalidMove: 'Invalid move.',
      turn: '{name}\u2019s turn ({symbol})\n{board}',
      win: '🎉 *Victory!* 🎉\nWell done {mention}!\n{board}',
      botWin: '🤖 *I won!* 🤖\n{board}',
      draw: '😐 *Draw!* 😐\n{board}',
      cancelled: '✅ Game cancelled.',
      nothingToCancel: 'There is no game to cancel.',
    },
    jokes: [
      'Why can\u2019t a fish be a lawyer? Because it loses every case in the water.',
      'What is the opposite of rice? Darkness rice. (Okay, that one only works in Hebrew.)',
      'Why did the programmer look tired? Too many unresolved issues keeping him up at night.',
      'What does a tired server say? "I need a quick restart..."',
      'Why do programmers prefer dark mode? Because light attracts bugs.',
    ],
    quotes: [
      'The best way to predict the future is to invent it.',
      'Don\u2019t judge each day by the harvest you reap but by the seeds that you plant.',
      'Success is going from failure to failure without losing enthusiasm.',
    ],
  },

  group: {
    addauth: {
      noPermManage: '🔒 The bot owner did not allow this group\u2019s admins to manage authorized users.',
      already: '{mention} is already authorized in this group.',
      ok: '✅ {mention} was added to this group\u2019s authorized list.',
    },
    removeauth: {
      ok: '✅ {mention} was removed from this group\u2019s authorized list.',
    },
    authlist: {
      title: '*👥 Authorized users in this group ({count})* 👥\n\n',
      empty: 'No authorized users in this group.',
      row: '• {mention}\n',
    },
    promote: { ok: '✅ {mention} was promoted!' },
    demote: { ok: '✅ {mention} was demoted!' },
    kick: {
      cantKickAdmin: 'I cannot remove an admin.',
      ok: '✅ {mention} was removed from the group!',
    },
    add: {
      needNumber: 'You need to provide a phone number to add.',
      ok: '✅ Added/invited successfully.',
      fail: '❌ Failed to add.',
    },
    grouplink: { title: 'Invite link:\n{url}' },
    tagall: { defaultText: 'Attention everyone!' },
    admins: { title: '👑 *Group admins* 👑\n\n', row: '• {mention}\n' },
    setsubject: {
      needText: 'You need to provide a new group name.',
      ok: '✅ Group name changed!',
    },
    setdesc: {
      needText: 'You need to provide a new group description.',
      ok: '✅ Group description updated!',
    },
    groupinfo: {
      card: '*Group info*\n*Name:* {name}\n*Created:* {created}\n*Owner:* {owner}\n*Participants:* {count}',
      unknown: 'unknown',
    },
    warn: {
      warned: '⚠️ {mention} was warned (total: {count}).',
      kicked: '{mention} reached {limit} warnings and was removed from the group.',
    },
    resetwarns: {
      ok: '✅ {mention}\u2019s warnings were reset.',
      none: '{mention} has no warnings.',
    },
    closegroup: { ok: '🔒 The group is now closed to admins only.' },
    opengroup: { ok: '🔓 The group is now open to everyone.' },
    antilink: {
      invalidMode: 'Invalid mode. Options: `delete_kick`, `delete_only`, `warn_delete`.',
      on: '✅ Link protection enabled (mode: `{mode}`).',
      off: '✅ Link protection disabled.',
      blocked: '✅ Domain `{domain}` added to the blacklist.',
      allowed: '✅ Link `{link}` added to the whitelist.',
      status: '*🛡️ Link protection*\n*State:* {state}\n*Action:* `{mode}`\n*Blacklist:* {blacklist}\n*Whitelist:* {whitelist}',
      stateOn: 'active ✅',
      stateOff: 'off ❌',
      listEmpty: 'empty',
      warnMsg: '*Warning!* 😠\n{mention}, links are not allowed in this group.',
      cantRemoveAdmin: '{mention} is a group admin/owner, I cannot remove them.',
      usage: 'Usage: `{prefix}antilink [on/off/block/allow/status]`\nType `{prefix}help antilink` for details.',
    },
    repctl: {
      on: '✅ Reputation system enabled in this group.',
      off: '✅ Reputation system disabled in this group.',
      permSet: '✅ From now on, {who} can award reputation points.',
      permEveryone: 'all members',
      permAuthorized: 'authorized users only',
      invalidPerm: 'Invalid option. Options: `everyone`, `authorized`.',
      status: '*⚙️ Reputation system*\n*State:* {state}\n*Who can award:* {who}',
      stateOn: 'active ✅',
      stateOff: 'off ❌',
      usage: 'Usage: `{prefix}rep [on/off/perm/status]`\nType `{prefix}help rep` for details.',
    },
  },

  owner: {
    status: {
      card: '*📊 Bot status* 📊\n*Mode:* {mode}\n*Language:* {lang}\n*Uptime:* {uptime}',
    },
    owner: { text: 'My owner is {mention}' },
    version: {
      card: '╭───「 *MeowBot* 」\n│\n├─ 💠 *Version:* 1.0\n├─ 👨‍💻 *Developer:* meowguck-art\n├─ 📦 *Library:* Baileys\n│\n╰───「 modular & bilingual 」',
    },
    setmode: {
      ok: '✅ Bot mode changed to: *{mode}*',
      invalid: 'Invalid mode. Options: `self`, `authorized`, `public`.',
    },
    leave: { bye: 'Leaving... goodbye! 👋' },
    nuke: {
      start: '...starting group cleanup',
      done: '✅ Everyone who is not an admin was removed.',
      none: 'Nobody to remove.',
    },
    addglobalauth: { ok: '✅ {mention} is now globally authorized.' },
    removeglobalauth: {
      ok: '✅ {mention} is no longer globally authorized.',
      cantRemoveOwner: 'Cannot remove the owner.',
    },
    globallist: {
      title: '*👑 Globally authorized users ({count})* 👑\n\n',
      row: '• {name} - {mention}\n',
    },
    groupperms: {
      invalidOption: 'Invalid option. Usage: `{prefix}groupperms [allow/deny]`',
      ok: '✅ From now on, this group\u2019s admins *{what}* manage authorized users.',
      can: 'can',
      cannot: 'cannot',
    },
  },

  sys: {
    antidelete: {
      title: '🗑️ *Deleted message* 🗑️\n\n*👤 User:* {user}\n*💬 Chat:* {chat}',
      content: '\n*📝 Content:* {text}',
      viewonce: '🖼️ *View-once message saved* 🖼️\n\n*👤 User:* {user}\n*💬 Chat:* {chat}',
      privateChat: 'private chat',
    },
    reminders: {
      prefix: '🔔 *Reminder:* {message}',
    },
    ready: {
      online: '✅ The bot is online!\n*Date:* {date}\n*Mode:* {mode} | *Lang:* {lang}',
    },
    pairing: {
      needNumber: '[MeowBot] ERROR: set BOT_NUMBER in .env to your bot phone number (digits only) for pairing-code login.',
      code: '[MeowBot] Pairing code for {number}: {code}  (WhatsApp > Linked devices > Link with phone number)',
      waiting: '[MeowBot] Waiting for pairing... enter the code on your phone.',
    },
  },
};
