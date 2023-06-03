const Router = require('koa-router');
const characters = require("./routes/characters.js");
const users = require("./routes/users.js")
const lobby = require("./routes/lobby.js")
const game = require("./routes/game.js")
const items = require("./routes/items.js")

const router = new Router();

router.use('/characters',characters.routes());
router.use('/users', users.routes());
router.use('/lobby', lobby.routes());
router.use('/game', game.routes());
router.use('/items', items.routes());

module.exports = router;