// Ephemeral per-chat/per-user interaction state.
// youtubeMenu: chatJid -> { results: [...], expires: ts }
// trivia:     chatJid -> { answer, timer }
// tictactoe:  chatJid -> { board, playerX, playerO, currentPlayer, gameOver }
const youtubeMenu = new Map();
const trivia = new Map();
const tictactoe = new Map();

module.exports = { youtubeMenu, trivia, tictactoe };
