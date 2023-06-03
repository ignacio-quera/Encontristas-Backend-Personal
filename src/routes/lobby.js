const Router = require('koa-router');

const router = new Router();

router.get("lobby.list", "/list", async (ctx) => {
    try {
        const lobbies = await ctx.orm.Lobby.findAll();
        ctx.body = lobbies;
        ctx.status = 200;
    } catch (error) {
        ctx.body = error;
        ctx.status = 400;
    }
})

router.get("lobby.show", "/", async (ctx) => {
    try {
        const { id } = ctx.query
        const lobby = await ctx.orm.Lobby.findByPk(parseInt(id));
        if (lobby == null) {
            ctx.status = 404
            return
        }
        ctx.body = lobby;
        ctx.status = 200;
    } catch (error) {
        ctx.body = error;
        ctx.status = 400;
    }
})

router.post("lobby.create", "/", async (ctx) => {
    try {
        const { hostId, name } = ctx.request.body
        const lobby = await ctx.orm.Lobby.create({
            hostId, name,
        });
        ctx.body = lobby;
        ctx.status = 201;
    } catch (error) {
        ctx.body = error;
        ctx.status = 400;
    }
})

router.put("lobby.update", "/", async (ctx) => {
    try {
        const { id, hostId, name } = ctx.request.body
        const lobby = await ctx.orm.Lobby.findByPk(id);
        if (lobby == null) {
            ctx.status = 404
            return
        }
        await lobby.update({ hostId, name });
        ctx.body = lobby;
        ctx.status = 200;
    } catch (error) {
        ctx.body = error;
        ctx.status = 400;
    }
})

router.delete("lobby.delete", "/", async (ctx) => {
    try {
        const { id } = ctx.request.body
        const lobby = await ctx.orm.Lobby.findByPk(id);
        if (lobby == null) {
            ctx.status = 404
            return
        }
        await lobby.destroy();
        ctx.body = lobby;
        ctx.status = 200;
    } catch (error) {
        ctx.body = error;
        ctx.status = 400;
    }
})


module.exports = router;
