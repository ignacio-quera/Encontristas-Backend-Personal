const Router = require('koa-router');   
const characters = require("./routes/characters");

const router = new Router();

router.use(characters.routes());

module.exports = router;