/*
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

//Sources
const SOURCE_A = 19;
const SOURCE_B = 23;
*/

const levelBase = [
  [2, 2, 2, 2, 2, 2, 2],
  [2, 1, 1, 1, 1, 1, 2],
  [2, 1, 1, 1, 1, 1, 2],
  [2, 1, 1, 1, 1, 1, 2],
  [2, 1, 1, 1, 1, 1, 2],
  [2, 1, 1, 1, 1, 1, 2],
  [2, 2, 2, 2, 2, 2, 2],
];

const level1 = [
  [2, 2, 2],
  [2, 13, 2],
  [2, 1, 2],
  [2, 3, 2],
  [2, 1, 2],
  [2, 19, 2],
  [2, 2, 2],
];

const level2 = [
  [2, 2, 2, 2, 2, 2, 2],
  [2, 7, 1, 5, 1, 13, 2],
  [2, 1, 1, 3, 1, 1, 2],
  [2, 1, 1, 55, 7, 1, 2],
  [2, 1, 1, 1, 1, 1, 2],
  [2, 19, 1, 1, 1, 23, 2],
  [2, 2, 2, 2, 2, 2, 2],
];
