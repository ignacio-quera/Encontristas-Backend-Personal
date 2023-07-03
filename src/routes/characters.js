/* eslint-disable no-console */
const Router = require("koa-router");
const { Op } = require("sequelize");
const { advanceTurn, boardSize } = require("./game");
const authUtils = require('../auth/jwt')

const itemData = require("../data/items");

const characterData = require("../data/characters");

const router = new Router();

router.post("characters.create", "/", authUtils.GetUserID, async (ctx) => {
  const {
    gameId, type, x, y,
  } = ctx.request.body;
  const userId = ctx.params.id;
  const game = await ctx.orm.Game.findByPk(gameId);
  if (game == null) {
    ctx.status = 404;
    ctx.body = "Game not found";
    return;
  }
  if (game.pm != userId) {
    ctx.status = 401;
    ctx.body = "Players can't create characters";
    return;
  }
  const proto = characterData[type]
  if (proto == null) {
    ctx.status = 400
    ctx.body = "Invalid character type"
    return
  }
  const pmUserId = game.pm;
  const pmPlayer = await ctx.orm.Player.findOne({
    where: { userId: pmUserId, gameId },
  });
  const lastTurn = await ctx.orm.Character.findOne({
    where: {
      gameId,
    },
    order: [
      ["turn", "DESC"],
    ],
  });
  const character = await ctx.orm.Character.create({
    gameId,
    playerId: pmPlayer.id,
    type,
    x,
    y,
    movement: proto.movement,
    turn: lastTurn == null ? 0 : lastTurn.turn + 1,
    hp: proto.hp,
    dmg: proto.dmg,
  });
  ctx.body = character;
  ctx.status = 201;
});

router.post("characters.move", "/move", authUtils.GetUserID, async (ctx) => {
  const { characterId, direction } = ctx.request.body;
  const userId = ctx.params.id;

  const character = await ctx.orm.Character.findByPk(characterId);
  const player = await ctx.orm.Player.findByPk(character.playerId);
  const userOfCharacter = await ctx.orm.User.findByPk(player.userId);
  if (userId != userOfCharacter.id) {
    ctx.body = "You cant move a character that isn't your own";
    ctx.status = 401;
    return;
  }
  if (character.movement <= 0) {
    ctx.body = "No movement left";
    ctx.status = 401;
    return;
  }
  const { gameId } = character;
  const game = await ctx.orm.Game.findByPk(gameId);
  if (character.turn !== game.turn) {
    ctx.body = "It's not your turn";
    ctx.status = 401;
    return;
  }
  ctx.body = direction;
  let [x, y] = [character.x, character.y];
  switch (direction) {
    case "up":
      y -= 1;
      break;
    case "down":
      y += 1;
      break;
    case "left":
      x -= 1;
      break;
    case "right":
      x += 1;
      break;
    default:
      ctx.status = 400;
      ctx.body = "Invalid direction";
      return;
  }
  // checkear
  if (x < 0 || x >= boardSize[0] || y < 0 || y >= boardSize[1]) {
    ctx.body = "Outside board";
    ctx.status = 401;
    return
  }
  const characters = await ctx.orm.Character.findAll({
    where: {
      gameId,
    },
  });
  for (const char of characters) {
    if (char.x === x && char.y === y) {
      ctx.body = "Character in the way";
      ctx.status = 401;
      return;
    }
  }
  const items = await ctx.orm.Item.findAll({
    where: {
      gameId,
    },
  });
  for (const item of items) {
    if (item.x === x && item.y === y) {
      const pickedItem = itemData[item.type];
      character.update(
        {
          hp: Math.max(1, character.hp + (pickedItem.hp || 0)),
          dmg: character.dmg + (pickedItem.dmg || 0),
          movement: character.movement + (pickedItem.movement || 0),
        },
      );
      item.destroy()
    }
  }
  character.x = x;
  character.y = y;
  character.update({ x, y });
  character.update({ movement: character.movement - 1 });
  ctx.body = [character.x, character.y];
  ctx.status = 200;
});

async function killCharacter(orm, character) {
  // Destroy the character
  await character.destroy();
  // Go up a level for every enemy killed
  const game = await orm.Game.findByPk(character.gameId);
  const player = await orm.Player.findByPk(character.playerId);
  if (player.userId === game.pm) {
    // Enemy died
    await game.update({
      level: game.level + 1,
    });
    const lastEnemy = await orm.Character.findOne({
      where: {
        gameId: game.id,
      },
      include: [{
        model: orm.Player,
        where: {
          userId: game.pm,
        },
      }],
    });
    if (lastEnemy == null && game.winner === null) {
      // Game finished
      game.update({
        winner: "players",
      });
    }
  } else {
    // Player character died
    const lastPlayer = await orm.Character.findOne({
      where: {
        gameId: game.id,
      },
      include: [{
        model: orm.Player,
        where: {
          userId: {
            [Op.ne]: game.pm,
          },
        },
      }],
    });
    if (lastPlayer == null && game.winner === null) {
      // No players left
      // Game finished
      game.update({
        winner: "monsters",
      });
    }
  }
}

async function damageCharacter(orm, attacker, target, dmg) {
  await target.update({
    hp: target.hp - dmg,
  });
  if (target.hp <= 0) {
    await killCharacter(orm, target);
  }
}

router.post("characters.action", "/action", authUtils.GetUserID, async (ctx) => {
  const { characterId, targetId } = ctx.request.body;
  const character = await ctx.orm.Character.findByPk(characterId);
  const target = await ctx.orm.Character.findByPk(targetId);
  const userId = ctx.params.id;
  const charData = characterData[character.type]

  const player = await ctx.orm.Player.findByPk(character.playerId);
  const userOfCharacter = await ctx.orm.User.findByPk(player.userId);
  if (userId != userOfCharacter.id) {
    ctx.body = { error: "You can't attack with a character that isn't your own" }
    ctx.status = 401;
    return;
  }
  // Do checks
  if (character == null) {
    ctx.status = 404;
    ctx.body = { error: "Character not found" }
    return;
  }
  const game = await ctx.orm.Game.findByPk(character.gameId);
  if (target == null) {
    ctx.status = 404;
    ctx.body = { error: "Missing target" }
    return;
  }
  if (target.gameId !== game.id) {
    ctx.status = 400;
    ctx.body = { error: "Target is not in the same game as character" }
    return;
  }
  if (character.turn !== game.turn) {
    ctx.status = 400;
    ctx.body = { error: "It is not the turn of the given character" }
    return;
  }
  if (Math.sqrt(Math.pow(character.x - target.x, 2) + Math.pow(character.y - target.y, 2)) > charData.range) {
    ctx.status = 400
    ctx.body = { error: "Objetivo fuera de tu alcance" }
    return
  }
  // Make attack
  await damageCharacter(ctx.orm, character, target, character.dmg);
  // Advance turn
  await advanceTurn(ctx.orm, game);

  ctx.status = 200;
  ctx.body = {
    message: `Dealt ${character.dmg} points of damage, target now has ${target.hp}`,
  }
  if (target.hp <= 0) {
    ctx.body.message += " (target killed)";
  }
});

module.exports = router;
