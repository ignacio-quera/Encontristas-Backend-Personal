const Router = require('koa-router');

const router = new Router();

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
            if ([character.x, character.y] == [x, y]) {
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

router.post("characters.action", "/action", async (ctx) => {
    const { characterId, gameId, targetId } = ctx.request.body;
    const character = await ctx.orm.Characters.findByPk(characterId);
    const target = await ctx.orm.Characters.findByPk(targetId);
    await target.update({ hp: hp - character.dmg });
})

router.post("characters.recieve_dmg", "/", async (ctx) => {

})

router.post("characters.new_turn", "/", async (ctx) => {

})



module.exports = router;