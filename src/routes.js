const Router = require("koa-router");
const characters = require("./routes/characters");
const users = require("./routes/users");
const lobby = require("./routes/lobby");
const authRoutes = require("./routes/authentication")
const { gameRouter } = require("./routes/game");
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

// router.use(jwtMiddleware( { secret: process.env.JWT_SECRET } ))
router.use(jwtMiddleware( { secret: process.env.JWT_SECRET } ))
router.use("/characters", characters.routes());
router.use("/users", users.routes());
router.use("/lobby", lobby.routes());
router.use("/game", gameRouter.routes());
router.use("/items", items.routes());

module.exports = router;
