const Router = require('koa-router');

const router = new Router();

router.post("item.create", "/", async (ctx) => {
    try {
        const { gameId, type, x, y } = ctx.request.body
        const game = ctx.orm.Game.findByPk(gameId)
        if (game == null) {
            ctx.status = 404
            ctx.body = "Game not found"
            return
        }
        const item = await ctx.orm.Item.create({
            gameId,
            type,
            x,
            y,
        })
        ctx.body = item
        ctx.status = 201
    } catch (error) {
        ctx.body = error;
        ctx.status = 400;
    }
})

router.put("item.update", "/", async (ctx) => {
    try {
        const { id, type, x, y } = ctx.request.body
        const item = await ctx.orm.Item.findByPk(id);
        if (item == null) {
            ctx.status = 404
            ctx.body = "Item not found"
            return
        }
        await item.update({ type, x, y })
        ctx.body = item
        ctx.status = 200
    } catch (error) {
        ctx.body = error;
        ctx.status = 400;
    }
})

router.delete("item.delete", "/", async (ctx) => {
    try {
        const { id } = ctx.query
        const item = await ctx.orm.Item.findByPk(id);
        if (item == null) {
            ctx.status = 404
            ctx.body = "Item not found"
            return
        }
        await item.destroy()
        ctx.body = item
        ctx.status = 200
    } catch (error) {
        ctx.body = error;
        ctx.status = 400;
    }
})


module.exports = router;
