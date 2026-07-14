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