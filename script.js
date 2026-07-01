// ====================
// CONSTANTS
// ====================

//Stage
const EMPTY = 1;
const WALL = 2;

//Enemy
const ENEMY = 3;
const WET_ENEMY = 15;
const GREASED_ENEMY = 33;
const FAILED_ENEMY = 31;

//Elements
const WATER = 5;
const LIGHTNING = 7;
const GREASE = 11;
const FIRE = 13;
const WATER_GREASE = 55;

//Mixes
const FIRE_LIGHTNING = 91;

//Sources
const SOURCE_A = 19;
const SOURCE_B = 23;

const elements = [WATER, LIGHTNING, GREASE, FIRE];

const placeableElements = [/*WATER, LIGHTNING,*/ GREASE/*, FIRE*/];

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

document.getElementById("resolveButton").onclick = resolveBoard;

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

      cell.className = "cell";

      if (value === activeSource) {
        cell.classList.add("activeSource");
      }

      cell.classList.add(getCellClass(value));

      if (value === SOURCE_A && networkA.element) {
        cell.classList.add(getCellClass(networkA.element));
      }

      if (value === SOURCE_B && networkB.element) {
        cell.classList.add(getCellClass(networkB.element));
      }

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

// TODO:
// belongsToNetwork() currently validates only by element type.
//
// This allows pre-placed tiles (e.g. WATER_GREASE)
// to be treated as part of any compatible network,
// even if they are not actually connected to the active Source.
//
// When Resolve + network propagation is implemented,
// this should be replaced by a connectivity check
// starting from the active Source.
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
  return (
    value !== WALL &&
    value !== SOURCE_A &&
    value !== SOURCE_B &&
    value !== WATER_GREASE
  );
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

  //resolveReaction(row, col);
}

function applyElement(row, col, element) {
  const currentValue = nextState[row][col];

  if (currentValue % element === 0) {
    return;
  }

  nextState[row][col] = currentValue * element;
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
    // Wet Enemy or Greased enemy + Grease or Water
    case 165:
      nextState[row][col] = FAILED_ENEMY;
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
    case 105:
      killEnemy(row, col);
      break;
    //Greased Enemy + Fire
    case 429:
      killEnemy(row, col);
      break;

    //Reactions between elements

    //Water + Lightning
    case 35:
      spreadChain(row, col, [WATER, WET_ENEMY, WATER_GREASE], LIGHTNING);
      nextState[row][col] = LIGHTNING;
      break;
    //Water + Fire
    case 65:
      nextState[row][col] = EMPTY;
      break;
    //Fire + Lightning
    case FIRE_LIGHTNING:
      nextState[row][col] = EMPTY;
      spreadExplosion(row, col);
      break;
    //Fire + Grease
    case 143:
      spreadChain(row, col, [GREASE, GREASED_ENEMY, WATER_GREASE], FIRE);
      nextState[row][col] = FIRE;
      break;
    //Water + Grease
    case WATER_GREASE:
      break;
    //Water + Grease + Lightning
    case 385:
      nextState[row][col] = LIGHTNING;
      spreadChain(row, col, [WATER, WET_ENEMY, WATER_GREASE], LIGHTNING);
      break;
    //Water + Grease + Fire
    case 715:
      nextState[row][col] = FIRE;
      spreadChain(row, col, [GREASE, GREASED_ENEMY, WATER_GREASE], FIRE);
      break;
    //Water + Grease + Fire + Lightning
    case 5005:
      nextState[row][col] = EMPTY;
      spreadExplosion(row, col);
      break;
    //Water + Grease duplicados
    case 275:
      nextState[row][col] = WATER_GREASE;
      break;

    case 605:
      nextState[row][col] = WATER_GREASE;
      break;

    //default case for unhandled reactions
    default:
      break;
  }
}

function spreadChain(row, col, fuels, spreadElement) {
  const neighbors = getNeighbors(row, col);

  for (const [nRow, nCol] of neighbors) {
    if (fuels.includes(board[nRow][nCol])) {
      applyElement(nRow, nCol, spreadElement);
    }
  }
}

function spreadExplosion(row, col) {
  const neighbors = getNeighbors(row, col);

  for (const [nRow, nCol] of neighbors) {
    if (isFlammable(board[nRow][nCol])) {
      applyElement(nRow, nCol, FIRE);
    }
  }
}

let nextState = null;
function resolveBoard() {
  nextState = board.map((row) => [...row]);

  for (let row = 0; row < board.length; row++) {
    for (let col = 0; col < board[row].length; col++) {
      resolveReaction(row, col);
    }
  }

  for (let row = 0; row < board.length; row++) {
    board[row] = [...nextState[row]];
  }
  checkVictory();
  renderBoard();
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

function getCellClass(value) {
  switch (value) {
    case EMPTY:
      return "cell-empty";

    case WALL:
      return "cell-wall";

    case ENEMY:
      return "cell-enemy";

    case WATER:
      return "cell-water";

    case LIGHTNING:
      return "cell-lightning";

    case GREASE:
      return "cell-grease";

    case FIRE:
      return "cell-fire";

    case WET_ENEMY:
      return "cell-wet-enemy";

    case GREASED_ENEMY:
      return "cell-greased-enemy";

    case FAILED_ENEMY:
      return "cell-failed-enemy";

    case WATER_GREASE:
      return "cell-water-grease";

    case SOURCE_A:
      return "cell-source-a";

    case SOURCE_B:
      return "cell-source-b";

    case 35:
      return "primed-water-lightning";

    case 715:
      return "primed-grease-fire";

    case 143:
      return "primed-grease-fire";

    case FIRE_LIGHTNING:
      return "cell-fire-lightning";

    case 5005:
      return "cell-fire-lightning";

    default:
      return "cell-unknown";
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
  nextState[row][col] = EMPTY;
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

// ==========================================================
// TODO - Next Milestones
// ==========================================================
//
// The Conway-style reaction system is now working:
//
// - Player placement and Resolve are separated.
// - Reactions are processed simultaneously using nextState.
// - Chain propagation works one tick at a time.
// - Multiple reactions can affect the same cell during the same tick.
//
// Before adding new mechanics, finish these core systems:
//
// 1. NETWORK CONNECTIVITY
//    Networks currently recognize only stable tiles.
//    Primed states (35, 143, 385, 715, etc.) should also count as part
//    of the network so the player can continue building through them.
//
//    Enemy states (Wet / Greased) should eventually behave the same.
//
// 2. ELEMENT LIMITS
//    Each level should define how many tiles of each element the player
//    is allowed to place.
//
// 3. MULTI-ELEMENT SOURCES
//    Allow a Source to provide more than one element.
//    This should be configurable per level (e.g. maxElementsPerSource = 2).
//
// After these systems are complete, the engine should be ready to start
// designing levels and adding new mechanics.
// ==========================================================
