// ====================
// CONSTANTS
// ====================

//Stage
const EMPTY = 1;
const WALL = 2;

//Enemy
const ENEMY = 3;
const WET_ENEMY = 17;
const GREASED_ENEMY = 29;
const FAILED_ENEMY = 31;

//Elements
const WATER = 5;
const LIGHTNING = 7;
const GREASE = 11;
const FIRE = 13;
const WATER_GREASE = 55;

//Sources
const SOURCE_A = 19;
const SOURCE_B = 23;

const elements = [WATER, LIGHTNING, GREASE, FIRE];

const placeableElements = [WATER, LIGHTNING, GREASE, FIRE];

// Colors
const COLORS = {
  EMPTY: "#727b91",
  WALL: "#2f3442",

  ENEMY: "#c0392b",
  WET_ENEMY: "#6ec6ff",
  GREASED_ENEMY: "#d4a15a",
  FAILED_ENEMY: "#7f8c8d",

  WATER: "#4ea6ff",
  LIGHTNING: "#00e5ff",
  GREASE: "#c68b3c",
  FIRE: "#ff5c5c",

  SOURCE_A: "#66ff88",
  SOURCE_B: "#ff66ff",

  UNKNOWN: "#888888",
};

// ====================
// GAME STATE
// ====================

let selectedElement = null;

let selectedButton = null;

let activeSource = null;

const networkA = {
  element: null,
};
const networkB = {
  element: null,
};

// ====================
// BOARD
// ====================

const board = level1;

// ====================
// DOM
// ====================

const boardElement = document.getElementById("board");

const toolbarElement = document.getElementById("toolbar");

// ====================
// FUNCTIONS
// ====================

// ====================
// RENDER
// ====================

function renderBoard() {
  boardElement.innerHTML = "";

  for (let row = 0; row < board.length; row++) {
    for (let col = 0; col < board[row].length; col++) {
      const cell = document.createElement("div");

      cell.className = "cell";

      const value = board[row][col];

      if (value === activeSource) {
        cell.classList.add("activeSource");
      }

      cell.onclick = () => {
        const activeElement =
          activeSource === SOURCE_A ? networkA.element : networkB.element;

        if (!selectedElement) {
          return;
        }

        if (value === SOURCE_A) {
          activeSource = SOURCE_A;

          if (networkA.element === null) {
            if (networkB.element === selectedElement) {
              return;
            }

            networkA.element = selectedElement;
          }

          renderBoard();

          return;
        }
        if (value === SOURCE_B) {
          activeSource = SOURCE_B;

          if (networkB.element === null) {
            if (networkA.element === selectedElement) {
              return;
            }

            networkB.element = selectedElement;
          }

          renderBoard();

          return;
        }
        if (isPlaceable(value) && isAdjacentToActiveNetwork(row, col)) {
          placeElement(row, col, activeElement);

          renderBoard();

          return;
        }
      };

      cell.style.backgroundColor = getColor(value);

      cell.textContent = value;

      boardElement.appendChild(cell);
    }
  }
}

// ====================
// NETWORKS
// ====================

function isAdjacentToActiveNetwork(row, col) {
  const neighbors = getNeighbors(row, col);

  const activeElement =
    activeSource === SOURCE_A ? networkA.element : networkB.element;

  for (const [nRow, nCol] of neighbors) {
    const value = board[nRow][nCol];

    if (value === activeSource || belongsToNetwork(value, activeElement)) {
      return true;
    }
  }

  return false;
}
function belongsToNetwork(value, networkElement) {
  if (value === networkElement) {
    return true;
  }

  if (value === WET_ENEMY) {
    return networkElement === WATER || networkElement === LIGHTNING;
  }

  if (value === GREASED_ENEMY) {
    return networkElement === GREASE || networkElement === FIRE;
  }
  if (value === WATER_GREASE) {
    return networkElement === WATER || networkElement === GREASE;
  }

  return false;
}

// ====================
// PLACEMENT
// ====================

function isPlaceable(value) {
  return value !== WALL && value !== SOURCE_A && value !== SOURCE_B;
}
function placeElement(row, col, element) {
  const currentValue = board[row][col];

  if (
    currentValue !== EMPTY &&
    !isPureElement(currentValue) &&
    currentValue !== ENEMY &&
    currentValue !== WET_ENEMY &&
    currentValue !== GREASED_ENEMY &&
    currentValue !== WATER_GREASE
  ) {
    return;
  }

  if (currentValue === element) {
    return;
  }

  board[row][col] = currentValue * element;

  resolveReaction(row, col);
}

// ====================
// REACTIONS
// ====================
// TODO:
// Reactions currently resolve instantly.
// Add animation / delay system.

function resolveReaction(row, col) {
  const value = board[row][col];

  switch (value) {
    //Enemy status
    // Enemy + Water
    case 15:
      board[row][col] = WET_ENEMY;
      break;
    // Enemy + Grease
    case 33:
      board[row][col] = GREASED_ENEMY;
      break;

    // Wet Enemy + Grease
    case 187:
      board[row][col] = FAILED_ENEMY;
      break;
    // Greased Enemy + Water
    case 145:
      board[row][col] = FAILED_ENEMY;
      break;

    //Enemy Kills

    //Enemy + Lightning
    case 21:
      killEnemy(row, col);
      break;
    //Enemy + Fire
    case 39:
      killEnemy(row, col);
      break;
    //Wet Enemy + Lightning
    case 119:
      killEnemy(row, col);
      break;
    //Greased Enemy + Fire
    case 377:
      killEnemy(row, col);
      break;

    //Reactions between elements

    //Water + Lightning
    case 35:
      board[row][col] = LIGHTNING;

      spreadChain(row, col, [WATER, WET_ENEMY, WATER_GREASE], LIGHTNING);
      break;
    //Water + Fire
    case 65:
      board[row][col] = EMPTY;
      break;
    //Fire + Lightning
    case 91:
      board[row][col] = EMPTY;

      spreadExplosion(row, col);
      break;
    //Fire + Grease
    case 143:
      board[row][col] = FIRE;

      spreadChain(row, col, [GREASE, GREASED_ENEMY, WATER_GREASE], FIRE);
      break;
    //Water + Grease
    case WATER_GREASE:
      break;
    //Water + Grease + Lightning
    case 385:
      board[row][col] = LIGHTNING;
      spreadChain(row, col, [WATER, WET_ENEMY, WATER_GREASE], LIGHTNING);
      break;
    //Water + Grease + Fire
    case 715:
      board[row][col] = FIRE;
      spreadChain(row, col, [GREASE, GREASED_ENEMY, WATER_GREASE], FIRE);
      break;
    //Water + Grease duplicados
    case 275:
      board[row][col] = WATER_GREASE;
      break;

    case 605:
      board[row][col] = WATER_GREASE;
      break;

    //default case for unhandled reactions
    default:
      console.error(`Unhandled case: ${value}`);
  }
}

function spreadChain(row, col, fuels, spreadElement) {
  const neighbors = getNeighbors(row, col);

  for (const [nRow, nCol] of neighbors) {
    if (fuels.includes(board[nRow][nCol])) {
      placeElement(nRow, nCol, spreadElement);
    }
  }
}

function spreadExplosion(row, col) {
  const neighbors = getNeighbors(row, col);

  for (const [nRow, nCol] of neighbors) {
    if (isFlammable(board[nRow][nCol])) {
      placeElement(nRow, nCol, FIRE);
    }
  }
}

// ====================
// HELPERS
// ====================

function getNeighbors(row, col) {
  const neighbors = [
    [row - 1, col],
    [row + 1, col],
    [row, col - 1],
    [row, col + 1],
  ];

  return neighbors.filter(
    ([nRow, nCol]) =>
      nRow >= 0 && nCol >= 0 && nRow < board.length && nCol < board[0].length,
  );
}

function getElementName(element) {
  switch (element) {
    case WATER:
      return "WATER";

    case LIGHTNING:
      return "LIGHTNING";

    case GREASE:
      return "GREASE";

    case FIRE:
      return "FIRE";
  }
}

function isFlammable(value) {
  return (
    value === EMPTY ||
    value === GREASE ||
    value === WATER ||
    value === ENEMY ||
    value === WET_ENEMY ||
    value === GREASED_ENEMY ||
    value === WATER_GREASE
  );
}

function getColor(value) {
  switch (value) {
    case EMPTY:
      return COLORS.EMPTY;

    case WALL:
      return COLORS.WALL;

    case ENEMY:
      return COLORS.ENEMY;

    case WATER:
      return COLORS.WATER;

    case LIGHTNING:
      return COLORS.LIGHTNING;

    case GREASE:
      return COLORS.GREASE;

    case FIRE:
      return COLORS.FIRE;

    case WET_ENEMY:
      return COLORS.WET_ENEMY;

    case GREASED_ENEMY:
      return COLORS.GREASED_ENEMY;

    case FAILED_ENEMY:
      return COLORS.FAILED_ENEMY;

    case SOURCE_A:
      if (networkA.element) {
        return getColor(networkA.element);
      }

      return COLORS.SOURCE_A;

    case SOURCE_B:
      if (networkB.element) {
        return getColor(networkB.element);
      }

      return COLORS.SOURCE_B;

    default:
      return COLORS.UNKNOWN;
  }
}

function isPureElement(value) {
  return elements.includes(value);
}

// ====================
// UI
// ====================

function createToolbar() {
  toolbarElement.innerHTML = "";

  for (const element of placeableElements) {
    const button = document.createElement("button");

    button.textContent = getElementName(element);

    button.style.backgroundColor = getColor(element);

    button.onclick = () => {
      selectedElement = element;

      if (selectedButton) {
        selectedButton.classList.remove("selectedTool");
      }

      selectedButton = button;

      selectedButton.classList.add("selectedTool");
    };

    toolbarElement.appendChild(button);
  }
}

// ====================
// VICTORY
// ====================

function killEnemy(row, col) {
  board[row][col] = EMPTY;

  checkVictory();
}
function checkVictory() {
  for (let row = 0; row < board.length; row++) {
    for (let col = 0; col < board[row].length; col++) {
      if (isEnemy(board[row][col])) {
        return;
      }
    }
  }

  alert("Victory!");
}
function isEnemy(value) {
  return (
    value === ENEMY ||
    value === WET_ENEMY ||
    value === GREASED_ENEMY ||
    value === FAILED_ENEMY
  );
}

// ====================
// INIT
// ====================

createToolbar();
renderBoard();
