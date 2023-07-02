/* eslint-disable no-console */
const Router = require("koa-router");
const { Op } = require("sequelize");
const characterData = require("../data/characters");

const router = new Router();

async function advanceTurn(orm, game) {
  // Find the next character in line
  let nextChar = await orm.Character.findOne({
    where: {
      gameId: game.id,
      turn: {
        [Op.gt]: game.turn,
      },
    },
    order: [
      ["turn", "ASC"],
    ],
  });
  if (nextChar == null) {
    // No further turns (end of the round)
    // Start from the beggining
    nextChar = await orm.Character.findOne({
      where: {
        gameId: game.id,
      },
      order: [
        ["turn", "ASC"],
      ],
    });
  }
  // Update the movement of the next character
  if (nextChar != null) {
    nextChar.update({
      movement: characterData[nextChar.type].movement,
    });
  }
  // Update the current turn
  await game.update({
    turn: nextChar == null ? 0 : nextChar.turn,
  });
}

router.get("game.show", "/", async (ctx) => {
  const { id } = ctx.query;
  const game = await ctx.orm.Game.findByPk(id);
  if (game == null) {
    ctx.status = 404;
    ctx.body = "Game not found";
    return;
  }
  const players = await ctx.orm.Player.findAll({
    where: {
      gameId: game.id,
    },
  });
  const characters = await ctx.orm.Character.findAll({
    where: {
      gameId: game.id,
    },
  });
  const items = await ctx.orm.Item.findAll({
    where: {
      gameId: game.id,
    },
  });
  ctx.body = {
    info: game,
    players,
    characters,
    items,
  };
  ctx.status = 200;
});

router.post("game.create", "/", async (ctx) => {
  const { lobbyId } = ctx.request.body;
  const lobby = await ctx.orm.Lobby.findByPk(lobbyId);
  if (lobby == null) {
    ctx.status = 404;
    ctx.body = "Lobby not found";
    return;
  }
  const participants = await ctx.orm.Participant.findAll({
    where: {
      lobbyId: lobby.id,
    },
  });
  // Create game instance
  const game = await ctx.orm.Game.create({
    name: lobby.name,
    pm: lobby.hostId,
    level: 1,
    turn: -1,
    winner: null,
  });
  await advanceTurn(ctx.orm, game);
  // Create players and their characters
  let j = 0;
  const promises = [];
  for (let k = 0; k < participants.length; k += 1) {
    const participant = participants[k];
    const playerPromise = ctx.orm.Player.create({
      gameId: game.id,
      userId: participant.userId,
    });
    const i = j;
    promises.push(playerPromise);
    if (participant.userId !== game.pm) {
      const type = ["wizard", "rogue", "ranger"][Math.floor(Math.random() * 3)];
      const charPromise = playerPromise.then((player) => {
        ctx.orm.Character.create({
          gameId: game.id,
          playerId: player.id,
          type,
          x: i,
          y: 0,
          movement: characterData[type].movement,
          turn: i,
          hp: characterData[type].hp,
          dmg: characterData[type].dmg,
        });
      });
      promises.push(charPromise);
      j += 1;
    }
  }
  await Promise.all(promises);
  // Destroy lobby
  await Promise.all(participants.map((p) => p.destroy()));
  await lobby.destroy();

  ctx.body = game;
  ctx.status = 201;
});

router.delete("game.delete", "/", async (ctx) => {
  const { id } = ctx.query;
  const game = await ctx.orm.Game.findByPk(id);
  if (game == null) {
    ctx.status = 404;
    ctx.body = "Game not found";
    return;
  }
  await ctx.orm.Character.destroy({
    where: {
      gameId: game.id,
    },
  });
  await ctx.orm.Item.destroy({
    where: {
      gameId: game.id,
    },
  });
  await ctx.orm.Player.destroy({
    where: {
      gameId: game.id,
    },
  });
  await game.destroy();
  ctx.body = "Game destroyed";
  ctx.status = 200;
});

module.exports = {
  gameRouter: router,
  advanceTurn,
};
