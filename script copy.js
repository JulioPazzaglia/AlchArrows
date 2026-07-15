// Stage
EMPTY = 1;
WALL = 2;

// Objectives
OBJECTIVE_ANY = 3;
OBJECTIVE_FIRE = 5;
OBJECTIVE_LIGHTNING = 7;

// Infrastructure
CONDUIT = 11;

// Flows
LIGHTNING = 13;
FIRE = 19;

// Derived states
const ELECTRIFIED_CONDUIT = CONDUIT * LIGHTNING; // 143
const BURNING_CONDUIT = CONDUIT * FIRE; // 209
const EXPLODING_CONDUIT = CONDUIT * LIGHTNING * FIRE; // 2717

//Como reviso si puedo placear conduit?
//Contiene Empty, Enemy, Lightning o Fire -> yes

//Como reviso si es reaccionable?
//Contiene conduit? X % 11 = 0? -> yes

// Functions
function applyElement(row, col, element) {
  const currentValue = nextState[row][col];

  if (currentValue % element === 0) {
    return;
  }

  nextState[row][col] = currentValue * element;
}

function spreadFlow(row, col, flow) {
  const neighbors = getNeighbors(row, col);

  for (const [nRow, nCol] of neighbors) {
    const value = board[nRow][nCol];

    if (!hasConduit(value)) {
      continue;
    }

    applyElement(nRow, nCol, flow);
  }
}

// Helpers

function hasConduit(value) {
  return value % CONDUIT === 0;
}

function hasLightning(value) {
  return value % LIGHTNING === 0;
}

function hasFire(value) {
  return value % FIRE === 0;
}

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
