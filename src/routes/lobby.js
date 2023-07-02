/* eslint-disable no-alert, no-console */
const Router = require("koa-router");
const authUtils = require('../auth/jwt')

const router = new Router();

router.get("lobby.list", "/list", async (ctx) => {
  const rawLobbies = await ctx.orm.Lobby.findAll({ include: ctx.orm.User });
  const lobbies = rawLobbies.map(lobby => ({
    id: lobby.id,
    name: lobby.name,
    hostId: lobby.hostId,
    hostName: lobby.User.username,
  }));
  ctx.body = lobbies;
  ctx.status = 200;
});

router.get("lobby.show", "/", async (ctx) => {
  const { id } = ctx.query;
  const lobby = await ctx.orm.Lobby.findByPk(id);
  if (lobby == null) {
    ctx.status = 404;
    ctx.body = "Lobby not found";
    return;
  }
  const rawParticipants = await ctx.orm.Participant.findAll({
    where: {
      lobbyId: lobby.id,
    },
    include: ctx.orm.User,
  });
  ctx.body = {
    lobby,
    participants: rawParticipants.map(part => ({
      id: part.id,
      userId: part.userId,
      username: part.User.username,
    })),
  };
  ctx.status = 200;
});

router.post("lobby.create", "/", authUtils.GetUserID, async (ctx) => {
  const { name } = ctx.request.body;
  const user = await ctx.orm.User.findByPk(ctx.params.id);
  if (user == null) {
    ctx.status = 404;
    ctx.body = "User not found";
    return;
  }
  // const curLobby = await ctx.orm.Participant.findOne({ where: { userId } });
  // const curGame = await ctx.orm.Player.findOne({ where: { userId } });
  // if (curLobby || curGame) {
  //   ctx.status = 400;
  //   ctx.body = "Already in lobby or game";
  //   return;
  // }
  const lobby = await ctx.orm.Lobby.create({
    hostId: user.id,
    name,
  });
  await ctx.orm.Participant.create({
    lobbyId: lobby.id,
    userId: user.id,
  });
  ctx.body = lobby;
  ctx.status = 201;
});

router.post("lobby.join", "/join", authUtils.GetUserID, async (ctx) => {
  const {lobbyId } = ctx.request.body;
  const userId = ctx.params.id
  const lobby = await ctx.orm.Lobby.findByPk(lobbyId);
  if (lobby == null) {
    ctx.status = 404;
    ctx.body = "Lobby not found";
    return;
  }
  const user = await ctx.orm.User.findByPk(ctx.params.id);
  if (user == null) {
    ctx.status = 404;
    ctx.body = "User not found";
    return;
  }
  // const curLobby = await ctx.orm.Participant.findOne({ where: { userId } });
  // const curGame = await ctx.orm.Player.findOne({ where: { userId } });
  // if (curLobby || curGame) {
  //   ctx.status = 400;
  //   ctx.body = "Already in lobby or game";
  //   return;
  // }
  if (await ctx.orm.Participant.findOne({ where: { lobbyId, userId } }) != null) {
    ctx.status = 400;
    ctx.body = "Already joined";
    return;
  }
  const participant = await ctx.orm.Participant.create({ lobbyId, userId });
  ctx.body = participant;
  ctx.status = 201;
});

router.put("lobby.update", "/", async (ctx) => {
  const { id, hostId, name } = ctx.request.body;
  const lobby = await ctx.orm.Lobby.findByPk(id);
  if (lobby == null) {
    ctx.status = 404;
    ctx.body = "Lobby not found";
    return;
  }
  await lobby.update({ hostId, name });
  ctx.body = lobby;
  ctx.status = 200;
});

router.delete("lobby.delete", "/", authUtils.GetUserID, async (ctx) => {
  const { id } = ctx.query;
  const userId = ctx.params.id
  const lobby = await ctx.orm.Lobby.findByPk(id);
  if (lobby == null) {
    ctx.status = 404;
    ctx.body = "Lobby not found";
    return;
  }
  if (lobby.hostId != userId) {
    ctx.status = 401;
    ctx.body = "You are not the lobby owner you rascal!"
    return;
  }
  await ctx.orm.Participant.destroy({
    where: {
      lobbyId: lobby.id,
    },
  });
  await lobby.destroy();
  ctx.body = "Lobby destroyed";
  ctx.status = 200;
});

// TODO: Exit lobby

module.exports = router;
