var jwt = require('jsonwebtoken')
const dotenv = require('dotenv');

dotenv.config();

function getJWTS(token) {
    const secret = process.env.JWT_SECRET;
    var payload = jwt.verify(token, secret);
    return payload.sub
    // console.log(payload.sub);
}

async function GetUserID(ctx, next) {
    var token = ctx.request.header.authorization.split(' ')[1];
    var id = getJWTS(token);
    console.log(`user with id ${id}`)
    ctx.params.id = id;
    return await next();
};

async function GetCharacterID(ctx, next) {
    const { characterId, direction } = ctx.request.body;
    const character = await ctx.orm.Character.findByPk(characterId);
    const player = await ctx.orm.Player.findByPk(character.playerId)
    const user = await ctx.orm.User.findByPk(player.userId)
    
    
    var token = ctx.request.header.authorization.split(' ')[1];
    var scope = getJWTScope(token);
    ctx.assert(scope.includes('user'), 403, "You're not a user");
    return await next();
}

module.exports = {
    GetUserID, GetCharacterID
};