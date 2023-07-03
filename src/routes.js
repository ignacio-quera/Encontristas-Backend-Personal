const Router = require("koa-router");
const characters = require("./routes/characters");
const { router: users } = require("./routes/users");
const lobby = require("./routes/lobby");
const authRoutes = require("./routes/authentication")
const { router: game } = require("./routes/game");
const items = require("./routes/items");
const jwtMiddleware = require('koa-jwt')
const dotenv = require('dotenv');

const router = new Router();

router.get("/health", (ctx) => {
  ctx.body = {
    status: "UP",
  };
});

router.use(authRoutes.routes());

router.use("/characters", characters.routes());
router.use("/users", users.routes());
router.use("/lobby", lobby.routes());
router.use("/game", game.routes());
router.use("/items", items.routes());

module.exports = router;
