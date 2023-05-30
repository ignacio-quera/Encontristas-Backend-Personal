const Router = require('koa-router');

const router = new Router();

const characters = [
    {
        "class": "wizard"
    },
    {
        "class": "ranger"
    },
    {
        "class": "rogue"
    }
]

router.get("characters.show", "/show", async (ctx) => {
    ctx.body = characters;
})

module.exports = router;