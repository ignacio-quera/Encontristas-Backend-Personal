const Router = require('koa-router');

const character_data = require('../data/characters')

const router = new Router();

router.get("game.show", "/", async (ctx) => {
    try {
        const { id } = ctx.query
        const game = await ctx.orm.Game.findByPk(id)
        if (game == null) {
            ctx.status = 404
            return
        }
        const players = await ctx.orm.Player.findAll({
            where: {
                gameId: game.id,
            },
        })
        const characters = await ctx.orm.Character.findAll({
            where: {
                gameId: game.id,
            },
        })
        ctx.body = {
            game,
            players,
            characters,
        }
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
            ctx.body = "Lobby not found"
            return
        }
        const participants = await ctx.orm.Participant.findAll({
            where: {
                lobbyId: lobby.id,
            },
        })
        // Destroy lobby
        for (const participant of participants) await participant.destroy()
        await lobby.destroy()
        console.log(lobby)
        console.log(participants)
        // Create game instance
        const game = await ctx.orm.Game.create({
            "name": lobby.name,
            "pm": lobby.hostId,
            "level": 1,
            "turn": 0,
        })
        // Create players and their characters
        let i = 0
        for (const participant of participants) {
            const player = await ctx.orm.Player.create({
                gameId: game.id,
                userId: participant.userId,
            })
            if (participant.userId === game.pm) { continue };
            const type = ['wizard', 'rogue', 'range'][Math.floor(Math.random()*3)];
            await ctx.orm.Character.create({
                gameId: game.id,
                playerId: player.id,
                type: type,
                x: i,
                y: 0,
                movement: character_data[type]["movement"],
                turn: i,
                hp: character_data[type]["hp"],
                dmg: character_data[type]["dmg"],
            })
            i += 1
        }

        ctx.body = game
        ctx.status = 201
    } catch (error) {
        console.error(error)
        ctx.body = error
        ctx.status = 400
    }
})

router.delete("game.delete", "/", async (ctx) => {
    try {
        const { id } = ctx.query
        const game = await ctx.orm.Game.findByPk(id)
        if (game == null) {
            ctx.status = 404
            return
        }
        await ctx.orm.Character.destroy({
            where: {
                gameId: game.id,
            },
        })
        await ctx.orm.Item.destroy({
            where: {
                gameId: game.id,
            },
        })
        await ctx.orm.Player.destroy({
            where: {
                gameId: game.id,
            },
        })
        await game.destroy()
        ctx.body = game
        ctx.status = 200
    } catch (error) {
        ctx.body = error
        ctx.status = 400
    }
})


module.exports = router
