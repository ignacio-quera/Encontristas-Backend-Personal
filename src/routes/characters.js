const Router = require('koa-router');
const { Op } = require('sequelize')
const { advanceTurn } = require('./game.js')

const router = new Router();

const characters = {
    "wizard": {
        "movement": 6,
        "hp": 10,
        "dmg": 8,
        "action": "spell"
    },
    "ranger": {
        "movement": 6,
        "hp": 20,
        "dmg": 6,
        "action": "arrow"
    },
    "rogue": {
        "movement": 6,
        "hp": 12,
        "dmg": 7,
        "action": "sword"
    },
    "goblin": {
        "movement": 5,
        "hp": 7,
        "dmg": 2,
        "action": "dagger"
    },
}

router.get("characters.list", "/", async (ctx) => {
    ctx.body = characters;
})

router.get("characters.show", "/:type", async (ctx) => {
    try {
        const character = await ctx.orm.Characters.findByPk(ctx.params.type);
        ctx.body = character;
        ctx.status = 200;
    } catch (error) {
        ctx.body = error;
        ctx.status = 400;
    }
})

router.post("characters.move", "/move", async (ctx) => {
    const { characterId, gameId, direction } = ctx.request.body;
    try {
        const character = await ctx.orm.Character.findByPk(characterId);
        console.log('character before', character)
        ctx.body = direction;
        let [x, y] = [character.x, character.y]
        switch (direction) {
            case "up":
                y -= 1
                break;
            case "down":
                await character.update({ y: character.y + 1 });
                break;
            case "left":
                await character.update({ y: character.y - 1 });
                break;
            case "right":
                await character.update({ y: character.y + 1 });
                break;
        }
        // checkear
        // updatear
        console.log('character after', character)
        ctx.status = 201;
    } catch (error) {
        console.error(error)
        ctx.body = error;
        ctx.status = 400;
    }
})

async function killCharacter(orm, character) {
    // Destroy the character
    await character.destroy()
    // Go up a level for every enemy killed
    const game = await orm.Game.findByPk(character.gameId)
    const player = await orm.Player.findByPk(character.playerId)
    if (player.userId === game.pm) {
        // Enemy died
        await game.update({
            level: game.level + 1,
        })
        if (game.level >= 3) {
            // Game finished
            // Kill all enemies
            await orm.Character.destroy({
                include: [{
                    model: orm.Player,
                    where: {
                        userId: game.pm,
                    },
                }],
            })
        }
    }
}

async function damageCharacter(orm, attacker, target, dmg) {
    await target.update({
        hp: target.hp - dmg,
    })
    if (target.hp <= 0) {
        await killCharacter(orm, target)
    }
}

router.post("characters.action", "/action", async (ctx) => {
    const { characterId, targetId } = ctx.request.body
    const character = await ctx.orm.Character.findByPk(characterId)
    const target = await ctx.orm.Character.findByPk(targetId)
    // Do checks
    if (character == null) {
        ctx.status = 404
        ctx.body = "Character not found"
        return
    }
    const game = await ctx.orm.Game.findByPk(character.gameId)
    if (target == null) {
        ctx.status = 404
        ctx.body = "Target not found"
        return
    }
    if (target.gameId !== game.id) {
        ctx.status = 400
        ctx.body = "Target is not in the same game as character"
        return
    }
    if (character.turn !== game.turn) {
        ctx.status = 400
        ctx.body = "It is not the turn of the given character"
        return
    }
    // Make attack
    await damageCharacter(ctx.orm, character, target, character.dmg)
    // Advance turn
    await advanceTurn(ctx.orm, game)

    ctx.status = 200
    ctx.body = `Dealt ${character.dmg} points of damage, target now has ${target.hp}`
})

module.exports = router;