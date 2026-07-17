const connectRows = 6;
const connectColumns = 7;
const connectBoardElement = document.querySelector("[data-connect-board]");
const connectStatus = document.querySelector("[data-connect-status]");
const connectModeButtons = document.querySelectorAll("[data-connect-mode]");
const connectNewGameButton = document.querySelector("[data-connect-new-game]");
const connectResetScoreButton = document.querySelector("[data-connect-reset-score]");
const connectRedScore = document.querySelector("[data-connect-red-score]");
const connectYellowScore = document.querySelector("[data-connect-yellow-score]");
const connectYellowLabel = document.querySelector("[data-connect-yellow-label]");

let connectBoard = [];
let connectPlayer = "red";
let connectMode = "friend";
let connectScores = { red: 0, yellow: 0 };
let connectGameOver = false;
let connectRoundId = 0;

function createConnectBoard() {
  return Array.from({ length: connectRows }, () => Array(connectColumns).fill(""));
}

function connectPlayerName(player) {
  if (player === "red") {
    return "Red";
  }
  return connectMode === "computer" ? "Computer" : "Yellow";
}

function setConnectStatus(message) {
  connectStatus.textContent = message;
}

function renderConnectScores() {
  connectRedScore.textContent = connectScores.red;
  connectYellowScore.textContent = connectScores.yellow;
  connectYellowLabel.textContent = connectMode === "computer" ? "Computer" : "Yellow";
}

function isColumnOpen(column) {
  return connectBoard[0][column] === "";
}

function renderConnectBoard(winningCells = []) {
  connectBoardElement.innerHTML = connectBoard.map((row, rowIndex) => row.map((value, columnIndex) => {
    const isWinner = winningCells.some(([winnerRow, winnerColumn]) => winnerRow === rowIndex && winnerColumn === columnIndex);
    const isComputerTurn = connectMode === "computer" && connectPlayer === "yellow";
    const label = value ? `${value === "red" ? "Red" : "Yellow"} piece` : `Empty space, column ${columnIndex + 1}`;
    return `<button class="connect-slot${value ? ` ${value}` : ""}${isWinner ? " winner" : ""}" type="button" role="gridcell" data-connect-column="${columnIndex}" aria-label="${label}" ${connectGameOver || isComputerTurn || !isColumnOpen(columnIndex) ? "disabled" : ""}><span aria-hidden="true"></span></button>`;
  }).join("")).join("");
}

function getConnectWinner(board) {
  const directions = [[0, 1], [1, 0], [1, 1], [1, -1]];

  for (let row = 0; row < connectRows; row += 1) {
    for (let column = 0; column < connectColumns; column += 1) {
      const player = board[row][column];
      if (!player) continue;

      for (const [rowStep, columnStep] of directions) {
        const cells = Array.from({ length: 4 }, (_, offset) => [row + offset * rowStep, column + offset * columnStep]);
        if (cells.every(([nextRow, nextColumn]) => board[nextRow]?.[nextColumn] === player)) {
          return { player, cells };
        }
      }
    }
  }
  return null;
}

function findOpenRow(board, column) {
  for (let row = connectRows - 1; row >= 0; row -= 1) {
    if (!board[row][column]) return row;
  }
  return -1;
}

function isConnectBoardFull() {
  return connectBoard[0].every(Boolean);
}

function finishConnectTurn() {
  const winner = getConnectWinner(connectBoard);
  if (winner) {
    connectGameOver = true;
    connectScores[winner.player] += 1;
    renderConnectScores();
    setConnectStatus(`${connectPlayerName(winner.player)} wins!`);
    renderConnectBoard(winner.cells);
    return;
  }

  if (isConnectBoardFull()) {
    connectGameOver = true;
    setConnectStatus("It's a draw game.");
    renderConnectBoard();
    return;
  }

  connectPlayer = connectPlayer === "red" ? "yellow" : "red";
  setConnectStatus(`${connectPlayerName(connectPlayer)}'s turn.`);
  renderConnectBoard();

  if (connectMode === "computer" && connectPlayer === "yellow") {
    const thisRound = connectRoundId;
    window.setTimeout(() => makeConnectMove(chooseComputerColumn(), true, thisRound), 500);
  }
}

function makeConnectMove(column, isComputerMove = false, thisRound = connectRoundId) {
  if (thisRound !== connectRoundId || connectGameOver || !isColumnOpen(column) || (connectMode === "computer" && connectPlayer === "yellow" && !isComputerMove)) return;
  const row = findOpenRow(connectBoard, column);
  if (row < 0) return;
  connectBoard[row][column] = connectPlayer;
  finishConnectTurn();
}

function chooseComputerColumn() {
  const openColumns = Array.from({ length: connectColumns }, (_, column) => column).filter(isColumnOpen);
  const testMove = (player) => openColumns.find((column) => {
    const testBoard = connectBoard.map((row) => [...row]);
    testBoard[findOpenRow(testBoard, column)][column] = player;
    return getConnectWinner(testBoard)?.player === player;
  });

  return testMove("yellow") ?? testMove("red") ?? openColumns.sort((a, b) => Math.abs(a - 3) - Math.abs(b - 3))[0];
}

function newConnectGame() {
  connectRoundId += 1;
  connectBoard = createConnectBoard();
  connectPlayer = "red";
  connectGameOver = false;
  setConnectStatus("Red goes first.");
  renderConnectBoard();
}

function setConnectMode(nextMode) {
  connectMode = nextMode;
  connectModeButtons.forEach((button) => {
    const isActive = button.dataset.connectMode === connectMode;
    button.classList.toggle("active", isActive);
    button.setAttribute("aria-selected", String(isActive));
  });
  renderConnectScores();
  newConnectGame();
}

connectBoardElement.addEventListener("click", (event) => {
  const slot = event.target.closest("[data-connect-column]");
  if (slot) makeConnectMove(Number(slot.dataset.connectColumn));
});
connectModeButtons.forEach((button) => button.addEventListener("click", () => setConnectMode(button.dataset.connectMode)));
connectNewGameButton.addEventListener("click", newConnectGame);
connectResetScoreButton.addEventListener("click", () => {
  connectScores = { red: 0, yellow: 0 };
  renderConnectScores();
  newConnectGame();
});

renderConnectScores();
newConnectGame();
