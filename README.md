# MeowBot 🤖

> **[🇮🇱 Hebrew README](README.he.md)**

A modular, bilingual (Hebrew/English) WhatsApp command bot built on [Baileys](https://github.com/WhiskeySockets/Baileys).
Every behavior knob — prefix, language, access mode, AI model, cooldowns, privacy systems — is controlled from `.env`.
No secrets are hardcoded anywhere; the API key lives in `.env` and never in git.

**59 commands** across AI, group management, authorized-user management, games, and everyday tools —
including a full reputation system, anti-link guard, anti-delete forensics, view-once capture,
reminders, YouTube audio downloads with a tap-to-pick song menu, and per-command emoji reactions.

---

## ✨ Highlights

- **🌍 Truly bilingual** — every user-facing string exists in Hebrew and English (`src/lang/he.js` / `src/lang/en.js`).
  Switch with `BOT_LANG`. Hebrew command names keep working in English mode and vice versa.
- **🔍 Self-auditing i18n** — `npm run audit` verifies key parity between the languages and fails the build
  if a single Hebrew string leaks into English mode. Missing keys return a loud `[key]` marker instead of
  silently falling back to the other language.
- **📋 Tap-to-pick YouTube menu** — search results arrive as a *classic* `ListMessage` dropdown
  (via [baileys-buttons](https://www.npmjs.com/package/baileys-buttons)), which renders on **both Android and iPhone**.
  (The interactive `native_flow` list does *not* render on iOS — this bot deliberately avoids it.)
- **🔑 Pairing-code login** — no QR scanning. The bot prints a code, you enter it once on the phone.
- **🧠 Pluggable AI model** — `GEMINI_MODEL` in `.env` (any Gemini model id, no code changes).
- **🛡️ Privacy systems** — anti-delete (forwards deleted messages to owners), view-once capture,
  anti-link with whitelist/blacklist and three enforcement modes.
- **⚙️ Psychopath-level `.env` control** — ~25 knobs, see [Configuration](#-configuration).

## 🚀 Quick start

```bash
git clone https://github.com/meowguck-art/meowbot.git
cd meowbot
npm install
cp .env.example .env
# edit .env: BOT_NUMBER, OWNER_NUMBERS, GEMINI_API_KEY, BOT_LANG ...
node index.js
```

On first run the bot prints a pairing code:

```
[MeowBot] Pairing code for 9725XXXXXXXX: 1234-5678
```

On your phone: **WhatsApp → Linked devices → Link with phone number** → enter the code.
The session is saved in `./auth/` — you only pair once.

### Termux (Android)

```bash
pkg install nodejs ffmpeg
# yt-dlp binary is auto-detected at /data/data/com.termux/files/usr/bin/yt-dlp
npm install
node index.js
```

`ffmpeg` is required for stickers. `yt-dlp` is required for YouTube downloads.

## ⚙️ Configuration

All in `.env` (see `.env.example`):

| Variable | Default | What it does |
|---|---|---|
| `BOT_NUMBER` | — | Bot's own number (digits). Used for pairing-code login |
| `OWNER_NUMBERS` | — | Comma-separated owner numbers. Owners bypass auth, cooldowns, admin checks |
| `PREFIX` | `!` | Command prefix |
| `BOT_LANG` | `he` | `he` \| `en` — every reply, menu and help text |
| `BOT_MODE` | `authorized` | `self` (owners only) \| `authorized` (owners + authorized users) \| `public` (everyone) |
| `GEMINI_API_KEY` | — | Google AI Studio key for `ask`/`summarize`/`imagine` |
| `GEMINI_MODEL` | `gemini-1.5-flash` | Any Gemini model id — swap without touching code |
| `AI_NAME` | `MeowBot` | Bot name used inside AI prompts |
| `REACTIONS_ENABLED` | `true` | Emoji reaction after each handled command (`❌` on error, `⏱️` on cooldown) |
| `COOLDOWN_SECONDS` | `5` | Per-user cooldown between commands (owners exempt) |
| `WARN_LIMIT` | `3` | Warnings before `warn` auto-kicks (persisted in DB, survives restarts) |
| `ANTI_DELETE` | `true` | Forward "deleted for everyone" messages to owners |
| `ANTI_DELETE_MEDIA` | `true` | Include the deleted message's media |
| `SAVE_VIEW_ONCE` | `true` | Save view-once photos/videos and forward them to owners |
| `ANTILINK_DEFAULT_MODE` | `delete_only` | `delete_only` \| `delete_kick` \| `warn_delete` |
| `YT_DLP_PATH` | auto | Empty = auto-detect (Termux path, then `PATH`) |
| `YT_AUDIO_FORMAT` | `opus` | `opus` (voice note) \| `mp3` |
| `YT_VOICE_NOTE` | `true` | Send downloads as voice notes |
| `STICKER_AUTHOR` / `STICKER_PACK` | `MeowBot` | Sticker metadata |
| `AUTH_DIR` / `DB_FILE` / `TEMP_DIR` | `./auth` `./data.json` `./temp` | Storage locations |

## 📁 Project structure

```
meowbot/
├── index.js                 # boot: config -> DB -> reminders -> WhatsApp
├── .env.example             # every knob, documented
├── src/
│   ├── config.js            # env parsing (booleans, ints, phone normalization)
│   ├── i18n.js              # t('a.b.c', {vars}) - never falls back across languages
│   ├── lang/
│   │   ├── he.js            # ALL Hebrew user-facing strings (267 keys)
│   │   ├── en.js            # ALL English user-facing strings (267 keys, Hebrew-free)
│   │   └── aliases.js       # bilingual subcommand/unit aliases (audited separately)
│   ├── db.js                # LowDB: users, reminders, group settings, auth, antilink, warnings
│   ├── states.js            # ephemeral: youtube menus, trivia games, tic-tac-toe boards
│   ├── utils.js             # JID helpers, quoted/target resolution, group admin checks
│   ├── ai.js                # Gemini: ask / summarize / imagine / translate
│   ├── youtube.js           # yt-search + yt-dlp audio download
│   ├── sticker.js           # ffmpeg -> webp stickers
│   ├── commands/
│   │   ├── index.js         # registry: name -> command (he + en aliases)
│   │   ├── general-ai.js    # ask, summarize, imagine, translate
│   │   ├── general-tools.js # ping..help (19 tools)
│   │   ├── general-fun.js   # thanks, rep, top5, trivia, tictactoe
│   │   ├── general-media.js # youtube (list menu), sticker, remind
│   │   ├── group.js         # 16 group-admin commands (incl. antilink + repctl)
│   │   └── owner.js         # 10 owner commands
│   ├── systems/
│   │   ├── reminders.js     # every-minute cron for due reminders
│   │   ├── antilink.js      # link enforcement pipeline
│   │   └── antidelete.js    # message ring buffer + revoke/view-once forwarding
│   ├── router.js            # the dispatcher: parse -> gates -> cooldown -> handler -> reaction
│   └── connection.js        # Baileys socket, pairing-code login, auto-reconnect
└── scripts/
    └── audit-lang.js        # `npm run audit` - the bilingual self-review
```

### The request pipeline

`messages.upsert` → revoke? → cache (anti-delete) → anti-link → list-menu taps →
trivia answers → `!5` game shortcuts → command parse → owner/groupAdmin/auth gates →
cooldown → handler → emoji reaction.

## 📜 Commands

Prefix is `!` by default. Every command has Hebrew **and** English names — both work in both languages.

### 🧠 AI & creativity

| Command | Aliases | Description |
|---|---|---|
| `ask` | שאל | Ask the AI anything |
| `summarize` | סכם | Summarize a long text (reply to it) |
| `imagine` | דמיין | Get a photorealistic description of an image from a prompt |
| `translate` | תרגם | `!translate [lang] [text]` (or reply to a message) |

### 🛠️ General & useful

| Command | Aliases | Description |
|---|---|---|
| `remind` | תזכורת | `!remind [time] [minutes/hours/days] [message]` |
| `yt` | יוטיוב, שיר, youtube, song | Search YouTube → tap a song in the menu → audio arrives as a voice note |
| `sticker` | סטיקר, s | Photo/video → sticker (needs ffmpeg) |
| `ping` | פינג | Response latency |
| `del` | מחק, delete | Delete a bot message (quote it) |
| `me` | אני | Your name, number, about |
| `getpp` | תמונתפרופיל, pp | Someone's profile picture |
| `wiki` | ויקי | Wikipedia link for a term |
| `joke` | בדיחה | Random joke |
| `quote` | ציטוט | Inspiring quote |
| `search` | חיפוש | Google search link |
| `shorten` | קיצור | Shorten a link (tinyurl) |
| `link` | לינק | Direct `wa.me` link to a number |
| `calc` | מחשבון | Math expression |
| `dice` / `coin` | קובייה / מטבע | Dice roll / coin flip |
| `time` / `date` | שעה / תאריך | Current time / date |
| `reverse` | הפוך | Reverse text |
| `tofile` | למי | Re-send media as a document file |
| `help` | עזרה | This menu (`!help [command]` for details) |

### ⭐ Community & games

| Command | Aliases | Description |
|---|---|---|
| `thanks` | תודה | Award a reputation point (reply to their message; group-only) |
| `rep` | מוניטין | Check reputation |
| `top5` | טופ5 | Reputation leaderboard |
| `trivia` | טריוויה | Trivia game, 5 rep points for the winner |
| `tictactoe` | איקסעיגול, ttt | `start` / `move [1-9]` (or just `!5`) / `cancel` — vs the bot or a friend |

### 🛡️ Authorized users (group admins)

| Command | Aliases | Description |
|---|---|---|
| `addauth` | הוסףמורשה | Authorize a user in this group |
| `removeauth` | הסרמורשה | De-authorize |
| `authlist` | רשימה | List authorized users |

Group admins can only use these if the owner ran `!groupperms allow` in the group.

### 👑 Group management (admins)

| Command | Aliases | Description |
|---|---|---|
| `promote` / `demote` | מנהל / הורד | Promote/demote (tag or reply) |
| `kick` | הסר | Remove a user |
| `add` | הוסף | `!add [number]` |
| `grouplink` | קישור | Invite link |
| `tagall` | תייגאתכולם | Tag everyone |
| `admins` | מנהלים | Admin list |
| `setsubject` / `setdesc` | שםקבוצה / תיאור | Rename / re-describe |
| `groupinfo` | מידעקבוצה | Group details |
| `warn` / `resetwarns` | אזהרה / אפסאזהרות | Warn (auto-kick at `WARN_LIMIT`) / reset |
| `closegroup` / `opengroup` | סגורקבוצה / פתחקבוצה | Admins-only / everyone |
| `antilink` | אנטילינק | `on [mode]` / `off` / `block [domain]` / `allow [link]` / `status` |
| `repctl` | הוקרה | `on` / `off` / `perm [everyone/authorized]` / `status` — reputation control panel |

### ⚙️ Owner only

`status` (סטטוס) · `owner` (בעלים) · `version` (גרסה) · `setmode` (שנהמצב) ·
`leave` (עזוב) · `nuke` (פצצה) · `addglobalauth` (הוסףמורשהגלובלי) ·
`removeglobalauth` (הסרמורשהגלובלי) · `globallist` (רשימהגלובלית) ·
`groupperms` (הרשאותקבוצה) `allow`/`deny`.

## 🌍 Language system

- `src/lang/he.js` and `src/lang/en.js` hold **every** user-facing string (267 keys each).
- `src/lang/aliases.js` holds bilingual subcommand aliases (`on`/`הפעל`, `off`/`כבה`, time units, …).
- Hebrew command names are registered alongside English ones, so `!עזרה` works when `BOT_LANG=en`.
- `npm run audit` checks: (1) key parity between the languages, (2) zero Hebrew characters in `en.js`,
  (3) zero Hebrew characters anywhere else except `he.js`, `aliases.js` and Hebrew command names.
  A missing key renders as `[the.key]` — it never silently shows the other language.

## 🧰 Troubleshooting

| Symptom | Fix |
|---|---|
| `428` on pairing-code request | The code was requested before the socket connected — the bot already waits ~3s; just restart |
| Connected but the bot is deaf (no replies) | Delete `./auth/` and re-pair — the session is corrupted, not the code |
| Stickers fail | Install `ffmpeg` (`pkg install ffmpeg` on Termux) |
| YouTube downloads fail | Install/update `yt-dlp`; note some networks/VPNs IP-block YouTube |
| `!warn` doesn't kick at the limit | The bot must be a group admin |

## 📄 License

MIT — do whatever you want with it.
