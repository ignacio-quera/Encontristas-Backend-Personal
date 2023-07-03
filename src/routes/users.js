/* eslint-disable no-alert, no-console */
const authUtils = require('../auth/jwt')
const Router = require("koa-router");
const { Op } = require('sequelize');

const router = new Router();


async function getUserLobbyAndGame(ctx, userId) {
  const curLobby = await ctx.orm.Participant.findOne({
    where: {
      userId,
    },
  });
  const curGame = await ctx.orm.Player.findOne({
    where: {
      userId,
    },
    include: {
      model: ctx.orm.Game,
      where: {
        winner: null,
      },
    },
  });
  return { curLobby, curGame }
}


router.get("users.show", "/", authUtils.GetUserID, async (ctx) => {
  const rawUser = await ctx.orm.User.findByPk(ctx.params.id);
  const { curLobby, curGame } = await getUserLobbyAndGame(ctx, rawUser.id)
  ctx.body = {
    id: rawUser.id,
    username: rawUser.username,
    mail: rawUser.mail,
    currentLobby: curLobby?.lobbyId ?? null,
    currentGame: curGame?.gameId ?? null,
  };
  ctx.status = 200;
});

router.put("users.edit", "/", authUtils.GetUserID, async (ctx) => {
  const { id } = ctx.params;
  const { username, password, mail } = ctx.request.body;
  const user = await ctx.orm.User.findByPk(id);
  await user.update({
    username,
    password,
    mail,
  });
  ctx.body = user;
  ctx.status = 201;
});

module.exports = { router, getUserLobbyAndGame };
