const winningLines = [
  [0, 1, 2],
  [3, 4, 5],
  [6, 7, 8],
  [0, 3, 6],
  [1, 4, 7],
  [2, 5, 8],
  [0, 4, 8],
  [2, 4, 6]
];

const cells = Array.from(document.querySelectorAll("[data-cell]"));
const statusText = document.querySelector("[data-game-status]");
const modeButtons = document.querySelectorAll("[data-mode]");
const resetBoardButton = document.querySelector("[data-reset-board]");
const resetScoreButton = document.querySelector("[data-reset-score]");
const scoreX = document.querySelector("[data-score-x]");
const scoreO = document.querySelector("[data-score-o]");
const scoreDraw = document.querySelector("[data-score-draw]");

let board = Array(9).fill("");
let currentPlayer = "X";
let gameOver = false;
let mode = "friend";
let scores = {
  X: 0,
  O: 0,
  draw: 0
};

function findWinner(squares) {
  for (const line of winningLines) {
    const [a, b, c] = line;
    if (squares[a] && squares[a] === squares[b] && squares[a] === squares[c]) {
      return { player: squares[a], line };
    }
  }

  return null;
}

function getAvailableMoves(squares) {
  return squares
    .map((value, index) => (value ? null : index))
    .filter((value) => value !== null);
}

function chooseComputerMove() {
  const availableMoves = getAvailableMoves(board);

  for (const move of availableMoves) {
    const candidate = [...board];
    candidate[move] = "O";
    if (findWinner(candidate)?.player === "O") {
      return move;
    }
  }

  for (const move of availableMoves) {
    const candidate = [...board];
    candidate[move] = "X";
    if (findWinner(candidate)?.player === "X") {
      return move;
    }
  }

  if (!board[4]) {
    return 4;
  }

  return availableMoves[0];
}

function renderBoard(winningLine = []) {
  cells.forEach((cell, index) => {
    const value = board[index];
    cell.textContent = value;
    cell.className = "tic-cell";
    cell.disabled = Boolean(value) || gameOver;
    cell.setAttribute("aria-label", `${cell.dataset.label || cell.getAttribute("aria-label")}${value ? `, ${value}` : ""}`);

    if (value) {
      cell.classList.add(value === "X" ? "marked-x" : "marked-o");
    }

    if (winningLine.includes(index)) {
      cell.classList.add("winner");
    }
  });
}

function renderScores() {
  scoreX.textContent = scores.X;
  scoreO.textContent = scores.O;
  scoreDraw.textContent = scores.draw;
}

function setStatus(text) {
  statusText.textContent = text;
}

function finishTurn() {
  const winner = findWinner(board);

  if (winner) {
    gameOver = true;
    scores[winner.player] += 1;
    setStatus(`${winner.player} wins.`);
    renderScores();
    renderBoard(winner.line);
    return;
  }

  if (getAvailableMoves(board).length === 0) {
    gameOver = true;
    scores.draw += 1;
    setStatus("Draw game.");
    renderScores();
    renderBoard();
    return;
  }

  currentPlayer = currentPlayer === "X" ? "O" : "X";
  setStatus(`${currentPlayer}'s turn.`);
  renderBoard();

  if (mode === "computer" && currentPlayer === "O") {
    window.setTimeout(() => makeMove(chooseComputerMove()), 350);
  }
}

function makeMove(index) {
  if (gameOver || board[index]) {
    return;
  }

  board[index] = currentPlayer;
  finishTurn();
}

function resetBoard() {
  board = Array(9).fill("");
  currentPlayer = "X";
  gameOver = false;
  setStatus(mode === "computer" ? "Your turn as X." : "X goes first.");
  renderBoard();
}

function resetScore() {
  scores = {
    X: 0,
    O: 0,
    draw: 0
  };
  renderScores();
  resetBoard();
}

function setMode(nextMode) {
  mode = nextMode;
  modeButtons.forEach((button) => {
    const isActive = button.dataset.mode === mode;
    button.classList.toggle("active", isActive);
    button.setAttribute("aria-selected", String(isActive));
  });
  resetBoard();
}

cells.forEach((cell) => {
  cell.dataset.label = cell.getAttribute("aria-label");
  cell.addEventListener("click", () => makeMove(Number(cell.dataset.cell)));
});

modeButtons.forEach((button) => {
  button.addEventListener("click", () => setMode(button.dataset.mode));
});

resetBoardButton.addEventListener("click", resetBoard);
resetScoreButton.addEventListener("click", resetScore);

renderScores();
resetBoard();
