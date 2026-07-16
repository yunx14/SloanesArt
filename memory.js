const cardSymbols = ["🌈", "🦄", "🐼", "🧁", "🦋", "⭐"];

const memoryBoard = document.querySelector("[data-memory-board]");
const memoryStatus = document.querySelector("[data-memory-status]");
const memoryModeButtons = document.querySelectorAll("[data-memory-mode]");
const newGameButton = document.querySelector("[data-new-game]");
const scoreOne = document.querySelector("[data-score-one]");
const scoreTwo = document.querySelector("[data-score-two]");
const playerOneLabel = document.querySelector("[data-player-one-label]");
const playerTwoLabel = document.querySelector("[data-player-two-label]");

let cards = [];
let flippedCards = [];
let currentPlayer = 1;
let scores = { 1: 0, 2: 0 };
let mode = "friend";
let isResolving = false;
let gameOver = false;
let roundId = 0;
let computerMemory = new Map();

function shuffle(values) {
  const shuffled = [...values];

  for (let index = shuffled.length - 1; index > 0; index -= 1) {
    const swapIndex = Math.floor(Math.random() * (index + 1));
    [shuffled[index], shuffled[swapIndex]] = [shuffled[swapIndex], shuffled[index]];
  }

  return shuffled;
}

function playerName(player) {
  if (player === 1) {
    return "Player 1";
  }

  return mode === "computer" ? "Computer" : "Player 2";
}

function setStatus(message) {
  memoryStatus.textContent = message;
}

function renderScores() {
  scoreOne.textContent = scores[1];
  scoreTwo.textContent = scores[2];
  playerOneLabel.textContent = "Player 1";
  playerTwoLabel.textContent = mode === "computer" ? "Computer" : "Player 2";
}

function renderBoard() {
  memoryBoard.innerHTML = cards.map((card, index) => {
    const isFaceUp = card.matched || flippedCards.includes(index);
    const label = card.matched
      ? `Matched ${card.symbol} card`
      : isFaceUp
        ? `${card.symbol} card, face up`
        : `Face-down card ${index + 1}`;

    return `
      <button class="memory-card${isFaceUp ? " is-flipped" : ""}${card.matched ? " is-matched" : ""}" type="button" role="gridcell" data-memory-card="${index}" aria-label="${label}" ${isFaceUp || isResolving || gameOver || (mode === "computer" && currentPlayer === 2) ? "disabled" : ""}>
        <span class="memory-card-inner">
          <span class="memory-card-face memory-card-back" aria-hidden="true">✦</span>
          <span class="memory-card-face memory-card-front" aria-hidden="true">${card.symbol}</span>
        </span>
      </button>
    `;
  }).join("");
}

function getUnmatchedIndexes() {
  return cards
    .map((card, index) => (!card.matched && !flippedCards.includes(index) ? index : null))
    .filter((index) => index !== null);
}

function rememberCard(index) {
  const symbol = cards[index].symbol;

  if (!computerMemory.has(symbol)) {
    computerMemory.set(symbol, new Set());
  }

  computerMemory.get(symbol).add(index);
}

function finishGame() {
  gameOver = true;
  const winner = scores[1] === scores[2] ? null : scores[1] > scores[2] ? 1 : 2;
  setStatus(winner ? `${playerName(winner)} wins the game!` : "It's a tie game!");
  renderBoard();
}

function startNextTurn() {
  currentPlayer = currentPlayer === 1 ? 2 : 1;
  setStatus(`${playerName(currentPlayer)}'s turn. Pick a card.`);
  renderBoard();

  if (mode === "computer" && currentPlayer === 2) {
    const thisRound = roundId;
    window.setTimeout(() => takeComputerTurn(thisRound), 550);
  }
}

function resolvePair() {
  const [firstIndex, secondIndex] = flippedCards;
  const isMatch = cards[firstIndex].symbol === cards[secondIndex].symbol;

  if (isMatch) {
    cards[firstIndex].matched = true;
    cards[secondIndex].matched = true;
    scores[currentPlayer] += 1;
    flippedCards = [];
    renderScores();

    if (cards.every((card) => card.matched)) {
      finishGame();
      return;
    }

    isResolving = false;
    setStatus(`${playerName(currentPlayer)} found a match! Go again.`);
    renderBoard();

    if (mode === "computer" && currentPlayer === 2) {
      const thisRound = roundId;
      window.setTimeout(() => takeComputerTurn(thisRound), 600);
    }
    return;
  }

  const thisRound = roundId;
  setStatus("Not a match. Switching turns...");
  window.setTimeout(() => {
    if (thisRound !== roundId) {
      return;
    }

    flippedCards = [];
    isResolving = false;
    startNextTurn();
  }, 900);
}

function flipCard(index, isComputerMove = false) {
  if (isResolving || gameOver || flippedCards.includes(index) || cards[index].matched || (mode === "computer" && currentPlayer === 2 && !isComputerMove)) {
    return;
  }

  flippedCards.push(index);
  rememberCard(index);
  renderBoard();

  if (flippedCards.length === 1) {
    setStatus(`${playerName(currentPlayer)}: pick one more card.`);
    return;
  }

  isResolving = true;
  resolvePair();
}

function getComputerPick(excluded = [], matchFor = null) {
  const available = getUnmatchedIndexes().filter((index) => !excluded.includes(index));

  if (matchFor !== null) {
    const rememberedMatches = computerMemory.get(cards[matchFor].symbol);
    const matchingCard = available.find((index) => rememberedMatches?.has(index));
    if (matchingCard !== undefined) {
      return matchingCard;
    }
  }

  const knownMatch = [...computerMemory.values()]
    .map((indexes) => [...indexes].filter((index) => available.includes(index)))
    .find((indexes) => indexes.length > 1)?.[0];

  if (knownMatch !== undefined) {
    return knownMatch;
  }

  return available[Math.floor(Math.random() * available.length)];
}

function takeComputerTurn(thisRound) {
  if (thisRound !== roundId || gameOver || currentPlayer !== 2 || isResolving) {
    return;
  }

  const firstPick = getComputerPick();
  flipCard(firstPick, true);

  window.setTimeout(() => {
    if (thisRound !== roundId || gameOver || currentPlayer !== 2 || isResolving) {
      return;
    }

    const secondPick = getComputerPick([firstPick], firstPick);
    flipCard(secondPick, true);
  }, 550);
}

function newGame() {
  roundId += 1;
  cards = shuffle([...cardSymbols, ...cardSymbols]).map((symbol) => ({ symbol, matched: false }));
  flippedCards = [];
  currentPlayer = 1;
  scores = { 1: 0, 2: 0 };
  isResolving = false;
  gameOver = false;
  computerMemory = new Map();
  renderScores();
  setStatus("Player 1's turn. Pick a card.");
  renderBoard();
}

function setMode(nextMode) {
  mode = nextMode;
  memoryModeButtons.forEach((button) => {
    const isActive = button.dataset.memoryMode === mode;
    button.classList.toggle("active", isActive);
    button.setAttribute("aria-selected", String(isActive));
  });
  newGame();
}

memoryBoard.addEventListener("click", (event) => {
  const card = event.target.closest("[data-memory-card]");
  if (card) {
    flipCard(Number(card.dataset.memoryCard));
  }
});

memoryModeButtons.forEach((button) => {
  button.addEventListener("click", () => setMode(button.dataset.memoryMode));
});

newGameButton.addEventListener("click", newGame);
newGame();
