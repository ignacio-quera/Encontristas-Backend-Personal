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
  const user = await ctx.orm.User.findByPk(ctx.params.id);
  console.log(`user with id ${ctx.params.id}: ${user}`);
  ctx.body = user;
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
