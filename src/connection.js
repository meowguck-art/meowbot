// WhatsApp connection via Baileys.
// First run uses pairing-code login: set BOT_NUMBER in .env, start the
// bot, then enter the printed code on the phone under
// WhatsApp > Linked devices > Link with phone number.
// The pairing code is requested ~3s after the socket connects -
// requesting it earlier fails with 428 (socket not ready yet).
const { default: makeWASocket, useMultiFileAuthState, fetchLatestBaileysVersion, DisconnectReason } = require('@whiskeysockets/baileys');
const pino = require('pino');
const cfg = require('./config');
const { t, lang } = require('./i18n');
const { sleep } = require('./utils');
const reminders = require('./systems/reminders');

let pairingRequested = false;

async function requestPairingCode(sock) {
  if (pairingRequested) return;
  pairingRequested = true;
  if (!cfg.BOT_NUMBER) {
    console.log(t('sys.pairing.needNumber'));
    return;
  }
  console.log(t('sys.pairing.waiting'));
  await sleep(3000); // let the socket finish connecting (else 428)
  try {
    const code = await sock.requestPairingCode(cfg.BOT_NUMBER);
    console.log(t('sys.pairing.code', { number: cfg.BOT_NUMBER, code }));
  } catch (e) {
    pairingRequested = false;
    console.error('[MeowBot] pairing-code request failed:', e.message);
  }
}

async function start({ onMessage, onUpdate }) {
  const { state, saveCreds } = await useMultiFileAuthState(cfg.AUTH_DIR);
  const { version } = await fetchLatestBaileysVersion();

  const sock = makeWASocket({
    version,
    auth: state,
    logger: pino({ level: 'silent' }),
    printQRInTerminal: false, // pairing code only, no QR
    browser: ['MeowBot', 'Chrome', '1.0'],
  });

  sock.ev.on('creds.update', saveCreds);

  sock.ev.on('messages.upsert', async ({ messages, type }) => {
    if (type !== 'notify') return;
    for (const msg of messages) {
      try {
        await onMessage(sock, msg);
      } catch (e) {
        console.error('[MeowBot] message handler error:', e.message);
      }
    }
  });

  if (onUpdate) sock.ev.on('messages.update', (updates) => onUpdate(sock, updates));

  sock.ev.on('connection.update', async ({ connection, lastDisconnect }) => {
    if (connection === 'open') {
      console.log('[MeowBot] connected to WhatsApp');
      reminders.attach(sock);
      if (!sock.authState.creds.registered) {
        await requestPairingCode(sock);
      } else {
        const date = new Date().toLocaleString(lang() === 'he' ? 'he-IL' : 'en-US');
        for (const jid of cfg.OWNER_JIDS) {
          try {
            await sock.sendMessage(jid, {
              text: t('sys.ready.online', { date, mode: cfg.BOT_MODE, lang: cfg.BOT_LANG }),
            });
          } catch (e) {
            console.error('[MeowBot] owner notify failed:', e.message);
          }
        }
      }
    }

    if (connection === 'close') {
      const code = lastDisconnect?.error?.output?.statusCode;
      console.log('[MeowBot] connection closed. code:', code);
      if (code === DisconnectReason.loggedOut) {
        console.log('[MeowBot] logged out - delete the auth dir and pair again');
        process.exit(1);
      }
      await sleep(5000);
      console.log('[MeowBot] reconnecting...');
      pairingRequested = false;
      return start({ onMessage, onUpdate });
    }
  });

  // Fresh session: ask for a pairing code once the socket is up.
  if (!sock.authState.creds.registered) {
    setTimeout(() => requestPairingCode(sock).catch(() => {}), 4000);
  }

  return sock;
}

module.exports = { start };
