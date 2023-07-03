var jwt = require('jsonwebtoken')
const dotenv = require('dotenv');
const { HttpError } = require('koa');

dotenv.config();

function getJWTS(token) {
    const secret = process.env.JWT_SECRET;
    var payload = jwt.verify(token, secret);
    return payload.sub
}

async function GetUserID(ctx, next) {
    if (typeof ctx.request.header.authorization !== 'string') {
        ctx.throw(401, 'Missing authorization header')
    }
    var token = ctx.request.header.authorization.split(' ')[1];
    var id = getJWTS(token);
    ctx.params.id = id;
    return await next();
};

module.exports = {
    GetUserID
};