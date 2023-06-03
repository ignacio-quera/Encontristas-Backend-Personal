const Router = require('koa-router');

const router = new Router();

router.get("game.show", "/", async (ctx) => {
    try {
        const { id } = ctx.query
        const game = await ctx.orm.Game.findByPk(id)
        ctx.body = game
        ctx.status = 200
    } catch (error) {
        ctx.body = error
        ctx.status = 400
    }
})

router.post("game.create", "/", async (ctx) => {
    try {
        const { lobbyId } = ctx.request.body
        const lobby = await ctx.orm.Lobby.findByPk(lobbyId)
        if (lobby == null) {
            ctx.status = 404
            return
        }
        const game = await ctx.orm.Game.create({
            "name": lobby.name,
            "pm": lobby.hostId,
            "level": 1,
            "turn": 0,
        })
        await lobby.destroy()
        ctx.body = game
        ctx.status = 201
    } catch (error) {
        ctx.body = error
        ctx.status = 400
    }
})

router.delete("game.delete", "/", async (ctx) => {
    try {
        const { id } = ctx.request.body
        const game = await ctx.orm.Game.findByPk(id)
        if (game == null) {
            ctx.status = 404
            return
        }
        await game.destroy()
        ctx.body = game
        ctx.status = 200
    } catch (error) {
        ctx.body = error
        ctx.status = 400
    }
})


module.exports = router
