/* eslint-disable no-alert, no-console */
const Router = require("koa-router");

const router = new Router();

router.post("users.create", "/", async (ctx) => {
  ctx.body = ctx.request.body;
  const user = await ctx.orm.User.create(ctx.request.body);
  ctx.body = user;
  ctx.status = 201;
});

router.get("users.list", "/", async (ctx) => {
  const users = await ctx.orm.User.findAll();
  ctx.body = users;
  ctx.status = 200;
});

router.get("users.show", "/:id", async (ctx) => {
  const rawUser = await ctx.orm.User.findByPk(ctx.params.id);
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

router.put("users.edit", "/:id", async (ctx) => {
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
