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
            ctx.body = "Lobby not found"
            return
        }
        const participants = await ctx.orm.Participant.findAll({
            where: {
                lobbyId: lobby.id,
            },
        })
        ctx.body = {
            lobby,
            participants,
        }
        ctx.status = 200;
    } catch (error) {
        console.error(error)
        ctx.body = error;
        ctx.status = 400;
    }
})

router.post("lobby.create", "/", async (ctx) => {
    try {
        const { userId, name } = ctx.request.body
        const user = await ctx.orm.User.findByPk(userId)
        if (user == null) {
            ctx.status = 404
            ctx.body = "User not found"
            return
        }
        const lobby = await ctx.orm.Lobby.create({
            hostId: userId,
            name,
        });
        const participant = await ctx.orm.Participant.create({
            lobbyId: lobby.id,
            userId: userId,
        })
        ctx.body = lobby;
        ctx.status = 201;
    } catch (error) {
        ctx.body = error;
        ctx.status = 400;
    }
})

router.post("lobby.join", "/join", async (ctx) => {
    try {
        const { userId, lobbyId } = ctx.request.body
        const lobby = await ctx.orm.Lobby.findByPk(lobbyId)
        if (lobby == null) {
            ctx.status = 404
            ctx.body = "Lobby not found"
            return
        }
        const user = await ctx.orm.User.findByPk(userId)
        if (user == null) {
            ctx.status = 404
            ctx.body = "User not found"
            return
        }
        if (await ctx.orm.Participant.findOne({ where: { lobbyId, userId } }) != null) {
            ctx.status = 204
            ctx.body = "Already joined"
            return
        }
        const participant = await ctx.orm.Participant.create({ lobbyId, userId })
        ctx.body = participant
        ctx.status = 201
    } catch (error) {
        console.error(error)
        ctx.body = error
        ctx.status = 400
    }
})

router.put("lobby.update", "/", async (ctx) => {
    try {
        const { id, hostId, name } = ctx.request.body
        const lobby = await ctx.orm.Lobby.findByPk(id);
        if (lobby == null) {
            ctx.status = 404
            ctx.body = "Lobby not found"
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
        const { id } = ctx.query
        const lobby = await ctx.orm.Lobby.findByPk(id);
        if (lobby == null) {
            ctx.status = 404
            ctx.body = "Lobby not found"
            return
        }
        await ctx.orm.Participant.destroy({
            where: {
                lobbyId: lobby.id,
            },
        })
        await lobby.destroy();
        ctx.body = lobby;
        ctx.status = 200;
    } catch (error) {
        ctx.body = error;
        ctx.status = 400;
    }
})


module.exports = router;
