const Router = require('koa-router');

const router = new Router();

const characters = {
    "wizard":  {
        "movement": 6,
        "hp": 10,
        "dmg": 8,
        "action": "spell"
    },
    "ranger" :{
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
    "goblin":{
        "movement": 5,
        "hp": 7,
        "dmg": 2,
        "action": "dagger"
    },
}

router.get("characters.list", "/", async (ctx) => {
    ctx.body = characters;
})

router.get("characters.show","/:type", async(ctx) => {
    try{
        const character = await ctx.orm.Characters.findByPk(ctx.params.type);
        ctx.body = character;
        ctx.status = 200;
    } catch(error){
        ctx.body = error;
        ctx.status = 400;
    }
})

router.post("characters.move", "/move", async(ctx) => {
    const {characterId, gameId, direction} = ctx.request.body;
    try{
        // const character = await ctx.orm.Characters.findByPk(characterId);
        ctx.body = direction;
        // switch (direction) {
        //     case "up":
        //         await character.update({ y: y-1});
        //         break;
        //     case "down":
        //         await character.update({ y: y+1});
        //         break;
        //     case "left":
        //         await character.update({ y: y-1});
        //         break;
        //     case "right":
        //         await character.update({ y: y+1});
        //         break;
        // }
        ctx.status = 201;
    } catch(error){
        ctx.body = error;
        ctx.status = 400;
    }   
})

router.post("characters.action", "/action", async(ctx) => {
    const {characterId, gameId, targetId} = ctx.request.body;
    const character = await ctx.orm.Characters.findByPk(characterId);
    const target = await ctx.orm.Characters.findByPk(targetId);
    
})

router.post("characters.recieve_dmg", "/", async(ctx) => {

})

router.post("characters.new_turn", "/", async(ctx) => {

})



module.exports = router;