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

module.exports = {
    GetUserID
};