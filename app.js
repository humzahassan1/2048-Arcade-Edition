const WIDTH = 4;
const SIZE = WIDTH * WIDTH;

// UNC Chapel Hill tile colors — Carolina Blue palette with intensifying glow
const UNC_TILES = {
  0:    { bg: '#0b1525', color: '#0b1525', glow: 'none' },
  2:    { bg: '#132840', color: '#7BAFD4', glow: '0 0 8px rgba(123,175,212,0.2)' },
  4:    { bg: '#163250', color: '#8CBDE0', glow: '0 0 10px rgba(140,189,224,0.25)' },
  8:    { bg: '#1a3c5e', color: '#9CCBEC', glow: '0 0 14px rgba(156,203,236,0.35)' },
  16:   { bg: '#1f4a72', color: '#7BAFD4', glow: '0 0 18px rgba(123,175,212,0.45)' },
  32:   { bg: '#255888', color: '#aad4f0', glow: '0 0 22px rgba(170,212,240,0.5)' },
  64:   { bg: '#2b6699', color: '#c0e4ff', glow: '0 0 28px rgba(192,228,255,0.55)' },
  128:  { bg: '#3278aa', color: '#d6efff', glow: '0 0 36px rgba(214,239,255,0.6)' },
  256:  { bg: '#3a8abb', color: '#e8f6ff', glow: '0 0 44px rgba(232,246,255,0.65)' },
  512:  { bg: '#4599c8', color: '#ffffff', glow: '0 0 52px rgba(123,175,212,0.7)' },
  1024: { bg: '#52a8d4', color: '#ffffff', glow: '0 0 60px rgba(123,175,212,0.75), 0 0 90px rgba(123,175,212,0.3)' },
  2048: { bg: '#7BAFD4', color: '#ffffff', glow: '0 0 70px rgba(123,175,212,0.85), 0 0 120px rgba(123,175,212,0.4)' },
};

// Duke Blue Devils tile colors — deep blue palette with intensifying glow
const DUKE_TILES = {
  0:    { bg: '#0b1525', color: '#0b1525', glow: 'none' },
  2:    { bg: '#0d1a35', color: '#4a7abf', glow: '0 0 8px rgba(0,26,87,0.2)' },
  4:    { bg: '#0f2040', color: '#5588cc', glow: '0 0 10px rgba(0,26,87,0.25)' },
  8:    { bg: '#12264d', color: '#6696d8', glow: '0 0 14px rgba(0,26,87,0.35)' },
  16:   { bg: '#152d5a', color: '#77a4e4', glow: '0 0 18px rgba(0,26,87,0.45)' },
  32:   { bg: '#183466', color: '#88b2f0', glow: '0 0 22px rgba(0,26,87,0.5)' },
  64:   { bg: '#1c3c77', color: '#99c0f8', glow: '0 0 28px rgba(0,26,87,0.55)' },
  128:  { bg: '#204488', color: '#aaccff', glow: '0 0 36px rgba(0,26,87,0.6)' },
  256:  { bg: '#254d99', color: '#bbddff', glow: '0 0 44px rgba(0,26,87,0.65)' },
  512:  { bg: '#2a55aa', color: '#cce4ff', glow: '0 0 52px rgba(0,26,87,0.7)' },
  1024: { bg: '#3060bb', color: '#ffffff', glow: '0 0 60px rgba(0,26,87,0.75), 0 0 90px rgba(0,26,87,0.3)' },
  2048: { bg: '#001A57', color: '#ffffff', glow: '0 0 70px rgba(0,26,87,0.85), 0 0 120px rgba(0,26,87,0.4)' },
};

function getTileConfig(value, playerIndex) {
  const config = (playerIndex === 1) ? DUKE_TILES : UNC_TILES;
  if (config[value]) return config[value];
  // beyond 2048 — use the 2048 style
  return config[2048];
}

// ==================== GAME STATE ====================

let mode = 'solo';
let players = [];
let gameOver = false;

class PlayerGame {
  constructor(playerIndex) {
    this.playerIndex = playerIndex;
    this.grid = new Array(SIZE).fill(0);
    this.score = 0;
    this.shufflesLeft = 2;
    this.alive = true;
    this.won = false;
  }
}

// ==================== MODE SWITCHING ====================

function startGame(selectedMode) {
  mode = selectedMode;
  document.getElementById('mode-select').style.display = 'none';
  document.getElementById('game-area').classList.add('active');

  const wrapper = document.getElementById('game-wrapper');
  const p2Side = document.getElementById('p2-side');
  const vsDivider = document.getElementById('vs-divider');
  const modeLabel = document.getElementById('mode-label');
  const p1Label = document.getElementById('p1-label');
  const p1Controls = document.getElementById('p1-controls');

  if (mode === 'solo') {
    wrapper.classList.add('solo-mode');
    p2Side.classList.add('hidden');
    vsDivider.classList.add('hidden');
    modeLabel.textContent = 'arcade edition';
    p1Label.textContent = '';
    p1Controls.textContent = 'Arrow keys to move';
  } else {
    wrapper.classList.remove('solo-mode');
    p2Side.classList.remove('hidden');
    vsDivider.classList.remove('hidden');
    modeLabel.textContent = 'versus mode';
    p1Label.textContent = 'Player 1';
    p1Controls.textContent = 'WASD to move';
  }

  initGame();
}

function backToMenu() {
  document.getElementById('game-area').classList.remove('active');
  document.getElementById('mode-select').style.display = '';
}

function initGame() {
  const numPlayers = mode === 'solo' ? 1 : 2;
  players = [];
  gameOver = false;

  for (let p = 0; p < numPlayers; p++) {
    players.push(new PlayerGame(p));
    const gridEl = document.getElementById(`p${p + 1}-grid`);
    gridEl.innerHTML = '';
    for (let i = 0; i < SIZE; i++) {
      const tile = document.createElement('div');
      tile.classList.add('tile');
      gridEl.appendChild(tile);
    }
    generate(players[p]);
    generate(players[p]);
    renderBoard(p);
    updateUI(p);
    document.getElementById(`p${p + 1}-overlay`).classList.add('hidden');
  }
}

function restartGame() {
  initGame();
}

// ==================== RENDERING ====================

function getGridTiles(playerIndex) {
  return document.getElementById(`p${playerIndex + 1}-grid`).children;
}

function renderBoard(playerIndex) {
  const p = players[playerIndex];
  const tiles = getGridTiles(playerIndex);
  for (let i = 0; i < SIZE; i++) {
    const val = p.grid[i];
    const cfg = getTileConfig(val, playerIndex);
    tiles[i].textContent = val === 0 ? '' : val;
    tiles[i].style.backgroundColor = cfg.bg;
    tiles[i].style.color = cfg.color;
    tiles[i].style.boxShadow = cfg.glow;
  }
}

function generate(p) {
  const empties = [];
  for (let i = 0; i < SIZE; i++) {
    if (p.grid[i] === 0) empties.push(i);
  }
  if (empties.length === 0) return false;
  const idx = empties[Math.floor(Math.random() * empties.length)];
  p.grid[idx] = Math.random() < 0.9 ? 2 : 4;

  const tile = getGridTiles(p.playerIndex)[idx];
  tile.classList.remove('spawned');
  void tile.offsetWidth;
  tile.classList.add('spawned');
  return true;
}

// ==================== MOVEMENT LOGIC ====================

function getRow(grid, rowIdx) {
  const start = rowIdx * WIDTH;
  return grid.slice(start, start + WIDTH);
}

function setRow(grid, rowIdx, vals) {
  const start = rowIdx * WIDTH;
  for (let i = 0; i < WIDTH; i++) grid[start + i] = vals[i];
}

function getCol(grid, colIdx) {
  const vals = [];
  for (let i = 0; i < WIDTH; i++) vals.push(grid[colIdx + i * WIDTH]);
  return vals;
}

function setCol(grid, colIdx, vals) {
  for (let i = 0; i < WIDTH; i++) grid[colIdx + i * WIDTH] = vals[i];
}

function slideLeft(vals) {
  const filtered = vals.filter(v => v !== 0);
  while (filtered.length < WIDTH) filtered.push(0);
  return filtered;
}

function mergeLine(vals) {
  let merges = 0, scoreGain = 0;
  for (let i = 0; i < WIDTH - 1; i++) {
    if (vals[i] !== 0 && vals[i] === vals[i + 1]) {
      vals[i] *= 2;
      vals[i + 1] = 0;
      scoreGain += vals[i];
      merges++;
    }
  }
  return { vals, merges, scoreGain };
}

function arraysEqual(a, b) {
  for (let i = 0; i < a.length; i++) if (a[i] !== b[i]) return false;
  return true;
}

function processMove(p, getLine, setLine, reverse) {
  const oldGrid = [...p.grid];
  let totalScore = 0;

  for (let i = 0; i < WIDTH; i++) {
    let line = getLine(p.grid, i);
    if (reverse) line = line.reverse();
    line = slideLeft(line);
    const merged = mergeLine(line);
    line = slideLeft(merged.vals);
    if (reverse) line = line.reverse();
    setLine(p.grid, i, line);
    totalScore += merged.scoreGain;
  }

  if (arraysEqual(oldGrid, p.grid)) return false;

  p.score += totalScore;
  generate(p);
  renderBoard(p.playerIndex);
  updateUI(p.playerIndex);
  animateMerges(p, oldGrid);
  checkWin(p);
  checkGameOver(p);
  return true;
}

function moveLeft(p)  { return processMove(p, getRow, setRow, false); }
function moveRight(p) { return processMove(p, getRow, setRow, true); }
function moveUp(p)    { return processMove(p, getCol, setCol, false); }
function moveDown(p)  { return processMove(p, getCol, setCol, true); }

function animateMerges(p, oldGrid) {
  const tiles = getGridTiles(p.playerIndex);
  for (let i = 0; i < SIZE; i++) {
    if (p.grid[i] > oldGrid[i] && p.grid[i] !== 2 && p.grid[i] !== 4 && oldGrid[i] !== 0) {
      tiles[i].classList.remove('merged');
      void tiles[i].offsetWidth;
      tiles[i].classList.add('merged');
    }
  }
}

// ==================== SHUFFLE ====================

function useShuffle(playerIndex) {
  if (playerIndex >= players.length) return;
  const p = players[playerIndex];
  if (p.shufflesLeft <= 0 || !p.alive || gameOver) return;

  p.shufflesLeft--;

  const values = [];
  for (let i = 0; i < SIZE; i++) {
    if (p.grid[i] !== 0) values.push(p.grid[i]);
  }

  // Fisher-Yates shuffle
  for (let i = values.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [values[i], values[j]] = [values[j], values[i]];
  }

  let vi = 0;
  for (let i = 0; i < SIZE; i++) {
    p.grid[i] = vi < values.length ? values[vi++] : 0;
  }

  renderBoard(playerIndex);
  updateUI(playerIndex);

  const tiles = getGridTiles(playerIndex);
  for (let i = 0; i < SIZE; i++) {
    if (p.grid[i] !== 0) {
      tiles[i].classList.remove('spawned');
      void tiles[i].offsetWidth;
      tiles[i].classList.add('spawned');
    }
  }
}

// ==================== WIN / LOSS ====================

function checkWin(p) {
  for (let i = 0; i < SIZE; i++) {
    if (p.grid[i] === 2048 && !p.won) {
      p.won = true;
      if (mode === 'solo') {
        const overlay = document.getElementById(`p${p.playerIndex + 1}-overlay`);
        const text = document.getElementById(`p${p.playerIndex + 1}-overlay-text`);
        const sub = document.getElementById(`p${p.playerIndex + 1}-overlay-sub`);
        overlay.classList.remove('hidden');
        text.textContent = 'YOU WIN!';
        text.style.color = '#7BAFD4';
        sub.textContent = `Score: ${p.score} — click to keep going`;
        overlay.onclick = () => overlay.classList.add('hidden');
      }
    }
  }
}

function checkGameOver(p) {
  // any empty cell?
  for (let i = 0; i < SIZE; i++) {
    if (p.grid[i] === 0) return;
  }
  // any possible merges?
  for (let i = 0; i < SIZE; i++) {
    if (i % WIDTH < WIDTH - 1 && p.grid[i] === p.grid[i + 1]) return;
    if (i + WIDTH < SIZE && p.grid[i] === p.grid[i + WIDTH]) return;
  }

  // dead
  p.alive = false;

  if (mode === 'solo') {
    const overlay = document.getElementById('p1-overlay');
    const text = document.getElementById('p1-overlay-text');
    const sub = document.getElementById('p1-overlay-sub');
    overlay.classList.remove('hidden');
    overlay.onclick = null;
    text.textContent = 'GAME OVER';
    text.style.color = '#ff3344';
    sub.textContent = `Final score: ${p.score}`;
    gameOver = true;
  } else {
    // versus — show eliminated overlay for this player
    const overlay = document.getElementById(`p${p.playerIndex + 1}-overlay`);
    const text = document.getElementById(`p${p.playerIndex + 1}-overlay-text`);
    const sub = document.getElementById(`p${p.playerIndex + 1}-overlay-sub`);
    overlay.classList.remove('hidden');
    text.textContent = 'ELIMINATED';
    text.style.color = '#ff3344';
    sub.textContent = `Final score: ${p.score}`;

    // if the other player is also dead, compare scores and declare winner
    const other = players[1 - p.playerIndex];
    if (!other.alive) {
      declareWinner();
    }
    // otherwise the other player keeps playing until they also die
  }
}

function declareWinner() {
  gameOver = true;
  const winColor = ['#7BAFD4', '#4a7abf']; // UNC, Duke
  for (let pi = 0; pi < 2; pi++) {
    const overlay = document.getElementById(`p${pi + 1}-overlay`);
    const text = document.getElementById(`p${pi + 1}-overlay-text`);
    const sub = document.getElementById(`p${pi + 1}-overlay-sub`);
    overlay.classList.remove('hidden');
    sub.textContent = `Score: ${players[pi].score}`;
    if (players[0].score > players[1].score) {
      text.textContent = pi === 0 ? 'WINNER' : 'DEFEATED';
      text.style.color = pi === 0 ? winColor[0] : '#ff3344';
    } else if (players[1].score > players[0].score) {
      text.textContent = pi === 1 ? 'WINNER' : 'DEFEATED';
      text.style.color = pi === 1 ? winColor[1] : '#ff3344';
    } else {
      text.textContent = 'DRAW';
      text.style.color = '#ffffff';
    }
  }
}

function updateUI(playerIndex) {
  const p = players[playerIndex];
  document.getElementById(`p${playerIndex + 1}-score`).textContent = p.score;
  document.getElementById(`p${playerIndex + 1}-shuffle`).disabled = p.shufflesLeft <= 0;
  document.getElementById(`p${playerIndex + 1}-shuffle-count`).textContent = `${p.shufflesLeft} left`;
}

// ==================== KEYBOARD CONTROLS ====================

document.addEventListener('keydown', (e) => {
  if (gameOver) return;
  if (!players.length) return;

  if (mode === 'solo') {
    if (e.key === 'ArrowLeft') { e.preventDefault(); moveLeft(players[0]); }
    else if (e.key === 'ArrowRight') { e.preventDefault(); moveRight(players[0]); }
    else if (e.key === 'ArrowUp') { e.preventDefault(); moveUp(players[0]); }
    else if (e.key === 'ArrowDown') { e.preventDefault(); moveDown(players[0]); }
  } else {
    // Player 1: WASD
    if (players[0].alive) {
      if (e.key === 'a' || e.key === 'A') moveLeft(players[0]);
      else if (e.key === 'd' || e.key === 'D') moveRight(players[0]);
      else if (e.key === 'w' || e.key === 'W') { e.preventDefault(); moveUp(players[0]); }
      else if (e.key === 's' || e.key === 'S') moveDown(players[0]);
    }
    // Player 2: Arrow keys
    if (players[1] && players[1].alive) {
      if (e.key === 'ArrowLeft') { e.preventDefault(); moveLeft(players[1]); }
      else if (e.key === 'ArrowRight') { e.preventDefault(); moveRight(players[1]); }
      else if (e.key === 'ArrowUp') { e.preventDefault(); moveUp(players[1]); }
      else if (e.key === 'ArrowDown') { e.preventDefault(); moveDown(players[1]); }
    }
  }
});