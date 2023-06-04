const Router = require('koa-router');
const { Op } = require('sequelize')
const { advanceTurn } = require('./game.js')

const itemData = require('../data/items.js');

const characterData = require('../data/characters.js')

const router = new Router();

router.post("characters.create", "/", async (ctx) => {
    const {gameId, type, x, y} = ctx.request.body;
    try {
        const game = await ctx.orm.Game.findByPk(gameId);
        const pmUserId = game.pm
        const pmPlayerId = ctx.orm.Player.findOne({
            where: {userId: pmUserId, gameId: gameId}
        })
        lastTurn = await ctx.orm.Character.findOne({
            where: {
                gameId: gameId,
            },
            order: [
                ['turn', 'DESC'],
            ]
        })
        const character = await ctx.orm.Character.create({
            gameId: gameId,
            playerId: pmPlayerId,
            type: type,
            x: x,
            y: y,
            movement: characterData[type]["movement"],
            turn: lastTurn == null? 0 : lastTurn.turn + 1,
            hp: characterData[type]["hp"],
            dmg: characterData[type]["dmg"],
        })
        ctx.body = character;
        ctx.status = 201;
    } catch(error) {
        console.error(error)
        ctx.body = error;
        ctx.status = 400;
    }
})

router.post("characters.move", "/move", async (ctx) => {
    const { characterId, direction } = ctx.request.body;
    try {
        const character = await ctx.orm.Character.findByPk(characterId);
        if (character.movement <= 0) {
             ctx.body = "No movement left";
             ctx.status = 401;
             return;
        }
        const gameId = character.gameId;
        console.log('character before', character)
        ctx.body = direction;
        and
        let [x, y] = [character.x, character.y]
        switch (direction) {
            case "up":
                y -= 1
                break;
            case "down":
                y += 1
                break;
            case "left":
                x -= 1
                break;
            case "right":
                x += 1
                break;
        }
        // checkear
        const characters = await ctx.orm.Character.findAll({
            where: {
                gameId: gameId,
            },
        })
        for (const character of characters) {
            if (character.x === x && character.y === y) {
                ctx.body = "Character in the way";
                ctx.status = 401;
                return;
            }   
        }
        const items = await ctx.orm.Item.findAll({
            where: {
                gameId: gameId,
            },
        })
        for (const item in items) {
            if (item.x === x && item.y === 1) {
                pickedItem = itemData[item.type];
                character.update(
                    {hp: character.hp + (pickedItem["hp"] || 0),
                    dmg: character.dmg + (pickedItem["dmg"] || 0),
                    movement: character.movement + (pickedItem["dmg"] || 0)}
                )
            }
        }
        // updatear
        character.x, character.y = x, y;
        console.log('character after', character)
        character.update({x: x, y: y});
        character.update({movement: character.movement - 1})
        ctx.body = [character.x, character.y]
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