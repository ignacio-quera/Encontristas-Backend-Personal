/* eslint-disable no-alert, no-console */
const authUtils = require('../auth/jwt')
const Router = require("koa-router");

const router = new Router();


router.get("users.show", "/", authUtils.GetUserID, async (ctx) => {
  const rawUser = await ctx.orm.User.findByPk(ctx.params.id);
  console.log(`user with id ${rawUser.id}: ${rawUser}`);
  // const curLobby = await ctx.orm.Participant.findOne({
  //   where: {
  //     userId: rawUser.id,
  //   },
  // });
  // const curGame = await ctx.orm.Player.findOne({
  //   where: {
  //     userId: rawUser.id,
  //   },
  // });
  ctx.body = {
    id: rawUser.id,
    username: rawUser.username,
    mail: rawUser.mail,
    // currentLobby: curLobby?.lobbyId ?? null,
    // currentGame: curGame?.gameId ?? null,
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

module.exports = router;
