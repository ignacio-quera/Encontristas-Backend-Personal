const Router = require("koa-router");

const router = new Router();

router.post("item.create", "/", async (ctx) => {
  const {
    gameId, type, x, y,
  } = ctx.request.body;
  const game = ctx.orm.Game.findByPk(gameId);
  if (game == null) {
    ctx.status = 404;
    ctx.body = "Game not found";
    return;
  }
  const item = await ctx.orm.Item.create({
    gameId,
    type,
    x,
    y,
  });
  ctx.body = item;
  ctx.status = 201;
});

router.put("item.update", "/", async (ctx) => {
  const {
    id, type, x, y,
  } = ctx.request.body;
  const item = await ctx.orm.Item.findByPk(id);
  if (item == null) {
    ctx.status = 404;
    ctx.body = "Item not found";
    return;
  }
  await item.update({ type, x, y });
  ctx.body = item;
  ctx.status = 200;
});

router.delete("item.delete", "/", async (ctx) => {
  const { id } = ctx.query;
  const item = await ctx.orm.Item.findByPk(id);
  if (item == null) {
    ctx.status = 404;
    ctx.body = "Item not found";
    return;
  }
  await item.destroy();
  ctx.body = item;
  ctx.status = 200;
});

module.exports = router;
