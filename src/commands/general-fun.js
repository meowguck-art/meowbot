// General commands: community & games.
const axios = require('axios');
const { downloadMediaMessage } = require('@whiskeysockets/baileys');
const { db, getUser, getGroupSettings } = require('../db');
const states = require('../states');
const ai = require('../ai');
const { lang } = require('../i18n');
const aliases = require('../lang/aliases');
const { mention, sleep } = require('../utils');

const drawBoard = (b) =>
  `\`${b[0]}|${b[1]}|${b[2]}\`\n\`-+-+-\`\n\`${b[3]}|${b[4]}|${b[5]}\`\n\`-+-+-\`\n\`${b[6]}|${b[7]}|${b[8]}\``;
const wins = [[0,1,2],[3,4,5],[6,7,8],[0,3,6],[1,4,7],[2,5,8],[0,4,8],[2,4,6]];
const checkWin = (b, s) => wins.some((p) => p.every((i) => b[i] === s));
const EMOJI_NUMS = ['1️⃣','2️⃣','3️⃣','4️⃣','5️⃣','6️⃣','7️⃣','8️⃣','9️⃣'];

async function botMove(c, game) {
  const free = game.board.map((cell, i) => (cell === '❌' || cell === '⭕' ? null : i)).filter((i) => i !== null);
  if (free.length === 0) return;
  const pick = free[Math.floor(Math.random() * free.length)];
  game.board[pick] = '⭕';
  if (checkWin(game.board, '⭕')) {
    await c.reply(c.t('fun.tictactoe.botWin', { board: drawBoard(game.board) }));
    states.tictactoe.delete(c.chatJid);
  } else if (game.board.every((cell) => cell === '❌' || cell === '⭕')) {
    await c.reply(c.t('fun.tictactoe.draw', { board: drawBoard(game.board) }));
    states.tictactoe.delete(c.chatJid);
  } else {
    game.currentPlayer = game.playerX;
    await c.reply(c.t('fun.tictactoe.turn', {
      name: mention(game.playerX), symbol: '❌', board: drawBoard(game.board),
    }), { mentions: [`${game.playerX}@s.whatsapp.net`] });
  }
}

module.exports = [
  {
    id: 'thanks', names: { he: ['תודה'], en: ['thanks'] }, cat: 'fun', reaction: '💖',
    async handler(c) {
      if (!c.isGroup) return c.reply(c.t('common.groupOnly'));
      const settings = getGroupSettings(c.chatJid);
      if (!settings.rep_enabled) return c.reply(c.t('fun.thanks.disabled', { prefix: c.prefix }));
      if (settings.rep_permission === 'authorized' && !c.authorized) return c.reply(c.t('fun.thanks.noPerm'));
      if (!c.quoted) return c.reply(c.t('fun.thanks.needQuote'));
      const target = c.quoted.part;
      if (target === c.senderPart) return c.reply(c.t('fun.thanks.selfThanks'));
      const u = getUser(target);
      u.reputation = (u.reputation || 0) + 1;
      await db.db.write();
      return c.reply(c.t('fun.thanks.ok', { name: mention(target) }), { mentions: [`${target}@s.whatsapp.net`] });
    },
  },
  {
    id: 'rep', names: { he: ['מוניטין'], en: ['rep'] }, cat: 'fun', reaction: '⭐',
    async handler(c) {
      const part = c.targetPart || c.senderPart;
      const u = db.db.data.users.find((x) => x.part === part);
      const name = part === c.senderPart ? mention(part) : mention(part);
      return c.reply(c.t('fun.rep.title', { name, count: u?.reputation || 0 }));
    },
  },
  {
    id: 'top5', names: { he: ['טופ5'], en: ['top5'] }, cat: 'fun', reaction: '🏆',
    async handler(c) {
      const sorted = [...db.db.data.users].sort((a, b) => (b.reputation || 0) - (a.reputation || 0)).slice(0, 5);
      if (sorted.length === 0) return c.reply(c.t('fun.top5.empty'));
      let out = c.t('fun.top5.title');
      sorted.forEach((u, i) => {
        out += c.t('fun.top5.row', { i: i + 1, name: u.name || mention(u.part), count: u.reputation || 0 });
      });
      return c.reply(out);
    },
  },
  {
    id: 'trivia', names: { he: ['טריוויה'], en: ['trivia'] }, cat: 'fun', reaction: '❓',
    async handler(c) {
      if (states.trivia.has(c.chatJid)) return c.reply(c.t('fun.trivia.busy'));
      const { data } = await axios.get('https://opentdb.com/api.php?amount=1&type=multiple&encode=url3986');
      const q = data.results[0];
      const to = lang();
      const dec = decodeURIComponent;
      const question = await ai.translateText(dec(q.question), to);
      const correct = await ai.translateText(dec(q.correct_answer), to);
      const wrong = await Promise.all(q.incorrect_answers.map((a) => ai.translateText(dec(a), to)));
      const options = [...wrong, correct].sort(() => Math.random() - 0.5);
      let text = c.t('fun.trivia.title', { question });
      options.forEach((opt, i) => { text += `${i + 1}. ${opt}\n`; });
      text += c.t('fun.trivia.sendAnswer');
      const timer = setTimeout(() => states.trivia.delete(c.chatJid), 60000);
      states.trivia.set(c.chatJid, { answer: correct, timer });
      return c.reply(text);
    },
  },
  {
    id: 'tictactoe', names: { he: ['איקסעיגול'], en: ['tictactoe', 'ttt'] }, cat: 'fun', reaction: '⭕',
    async handler(c) {
      const sub = (c.args[0] || '').toLowerCase();
      const gameId = c.chatJid;
      if (aliases.matches(aliases.tttStart, sub)) {
        if (states.tictactoe.has(gameId)) return c.reply(c.t('fun.tictactoe.busy'));
        const opponent = c.targetPart;
        if (!c.isGroup && opponent && opponent !== c.senderPart) {
          return c.reply(c.t('fun.tictactoe.noPrivateOpponent'));
        }
        const botPart = c.sock.user.id.split('@')[0].split(':')[0];
        const playerX = c.senderPart;
        const playerO = opponent || botPart;
        states.tictactoe.set(gameId, {
          board: [...EMOJI_NUMS], playerX, playerO, currentPlayer: playerX, gameOver: false,
        });
        const px = mention(playerX);
        const po = playerO === botPart ? c.t('fun.tictactoe.botName') : mention(playerO);
        return c.reply(c.t('fun.tictactoe.start', { px, po, board: drawBoard(EMOJI_NUMS) }),
          { mentions: [`${playerX}@s.whatsapp.net`, ...(playerO === botPart ? [] : [`${playerO}@s.whatsapp.net`])] });
      }
      if (aliases.matches(aliases.tttCancel, sub)) {
        if (!states.tictactoe.has(gameId)) return c.reply(c.t('fun.tictactoe.nothingToCancel'));
        states.tictactoe.delete(gameId);
        return c.reply(c.t('fun.tictactoe.cancelled'));
      }
      if (aliases.matches(aliases.tttMove, sub) || /^\d$/.test(sub)) {
        const game = states.tictactoe.get(gameId);
        if (!game || game.gameOver) return c.reply(c.t('fun.tictactoe.noGame', { prefix: c.prefix }));
        if (c.senderPart !== game.currentPlayer) return c.reply(c.t('fun.tictactoe.notYourTurn'));
        const moveIdx = /^\d$/.test(sub) ? parseInt(sub, 10) - 1 : parseInt(c.args[1], 10) - 1;
        if (!Number.isInteger(moveIdx) || moveIdx < 0 || moveIdx > 8 || game.board[moveIdx] === '❌' || game.board[moveIdx] === '⭕') {
          return c.reply(c.t('fun.tictactoe.invalidMove'));
        }
        const symbol = game.currentPlayer === game.playerX ? '❌' : '⭕';
        game.board[moveIdx] = symbol;
        if (checkWin(game.board, symbol)) {
          game.gameOver = true;
          states.tictactoe.delete(gameId);
          return c.reply(c.t('fun.tictactoe.win', { mention: mention(c.senderPart), board: drawBoard(game.board) }),
            { mentions: [`${c.senderPart}@s.whatsapp.net`] });
        }
        if (game.board.every((cell) => cell === '❌' || cell === '⭕')) {
          game.gameOver = true;
          states.tictactoe.delete(gameId);
          return c.reply(c.t('fun.tictactoe.draw', { board: drawBoard(game.board) }));
        }
        game.currentPlayer = game.currentPlayer === game.playerX ? game.playerO : game.playerX;
        const botPart = c.sock.user.id.split('@')[0].split(':')[0];
        if (game.currentPlayer === botPart) {
          await sleep(1500);
          if (!states.tictactoe.has(gameId)) return;
          return botMove(c, game);
        }
        const nextName = mention(game.currentPlayer);
        const nextSymbol = game.currentPlayer === game.playerX ? '❌' : '⭕';
        return c.reply(c.t('fun.tictactoe.turn', { name: nextName, symbol: nextSymbol, board: drawBoard(game.board) }),
          { mentions: [`${game.currentPlayer}@s.whatsapp.net`] });
      }
      return c.reply(c.t('fun.tictactoe.usage', { prefix: c.prefix }));
    },
  },
];
