/* eslint-disable no-alert, no-console */
const Router = require("koa-router");
const bcrypt = require("bcrypt");
const saltRounds = 10;  

const router = new Router();

router.post("users.create", "/", async (ctx) => {
  const {
    username, password, mail
  } = ctx.request.body;
  bcrypt.hash(password, saltRounds, function(err, hash) {
    console.log(hash);
    const user = ctx.orm.User.create({username: username, password: hash, mail: mail});
});
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
