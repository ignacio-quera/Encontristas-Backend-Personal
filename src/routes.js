const Router = require("koa-router");
const characters = require("./routes/characters");
const users = require("./routes/users");
const lobby = require("./routes/lobby");
const { gameRouter } = require("./routes/game");
const items = require("./routes/items");

const router = new Router();

router.use("/characters", characters.routes());
router.use("/users", users.routes());
router.use("/lobby", lobby.routes());
router.use("/game", gameRouter.routes());
router.use("/items", items.routes());

module.exports = router;
