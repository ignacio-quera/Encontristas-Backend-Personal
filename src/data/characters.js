const characterData = {
  wizard: {
    movement: 6,
    hp: 10,
    dmg: 8,
    action: "spell",
    range: 3,
  },
  ranger: {
    movement: 6,
    hp: 20,
    dmg: 6,
    action: "arrow",
    range: 5,
  },
  rogue: {
    movement: 6,
    hp: 12,
    dmg: 7,
    action: "sword",
    range: 1,
  },
  goblin: {
    movement: 5,
    hp: 7,
    dmg: 2,
    action: "sword",
    range: 1,
  },
  slime: {
    movement: 4,
    hp: 30,
    dmg: 3,
    action: "sword",
    range: 1,
  },
  giant_jellyfish: {
    movement: 10,
    hp: 10,
    dmg: 3,
    action: "sword",
    range: 1.5,
  },
};

module.exports = characterData;
