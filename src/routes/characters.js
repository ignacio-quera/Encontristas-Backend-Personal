const Router = require('koa-router');
const { Op } = require('sequelize')

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

async function killCharacter(character) {
    await character.destroy()
}

async function damageCharacter(attacker, target, dmg) {
    target.update({
        hp: target.hp - dmg,
    })
    if (target.hp <= 0) {
        killCharacter(target)
    }
}

router.post("characters.action", "/action", async (ctx) => {
    const { characterId, targetId } = ctx.request.body
    const character = await ctx.orm.Character.findByPk(characterId)
    const target = await ctx.orm.Character.findByPk(targetId)
    const game = await ctx.orm.Game.findByPk(character.gameId)
    // Do checks
    if (character == null) {
        ctx.status = 404
        ctx.body = "Character not found"
        return
    }
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
    await damageCharacter(character, target, character.dmg)
    // Advance turn
    let nextChar = await ctx.orm.Character.findOne({
        where: {
            turn: {
                [Op.gt]: game.turn,
            },
        },
        order: [
            ['turn', 'ASC'],
        ],
    })
    if (nextChar == null) {
        // No further turns (end of the round)
        // Start from the beggining
        nextChar = await ctx.orm.Character.findOne({
            order: [
                ['turn', 'ASC'],
            ],
        })
    }
    await game.update({
        turn: nextChar == null ? 0 : nextChar.turn,
    })

    ctx.status = 200
    ctx.body = `Dealt ${character.dmg} points of damage, target now has ${target.hp}`
})

module.exports = router;