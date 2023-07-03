const Router = require('koa-router');
const { Op } = require("sequelize");
var jwt = require('jsonwebtoken');
const dotenv = require('dotenv');
const bcrypt = require("bcrypt");
const saltRounds = 10;  


dotenv.config();

const router = new Router();

router.post("authentication.signup", "/signup", async (ctx) => {
    const authInfo = ctx.request.body;
    let user = await ctx.orm.User.findOne({ where: { [Op.or]: [{ mail: authInfo.mail }, { username: authInfo.mail }] } })
    if (user) {
        ctx.body = `The user already exists`;
        ctx.status = 400;
        return;
    }
    try {
        const hash_password = bcrypt.hashSync(authInfo.password, saltRounds);
        user = await ctx.orm.User.create({ username: authInfo.username, password: hash_password, mail: authInfo.mail });
    } catch (error) {
        ctx.body = error;
        ctx.status = 400;
        return;
    }
    ctx.body = {
        username: user.username,
        mail: user.mail
    };
    ctx.status = 201;
})

router.post("authentication.login", "/login", async (ctx) => {
    let user;
    const authInfo = ctx.request.body
    try {
        user = await ctx.orm.User.findOne({ where: { mail: authInfo.mail } });
    }
    catch (error) {
        ctx.body = error;
        ctx.status = 400;
        return;
    }
    if (!user) {
        ctx.body = `The user by the mail '${authInfo.mail}' was not found`;
        ctx.status = 400;
        return;
    }
    if (bcrypt.compareSync(authInfo.password, user.password)) {
        ctx.body = {
            username: user.username,
            mail: user.mail,
        };
        ctx.status = 200;
    } else {
        ctx.body = "Incorrect password";
        ctx.status = 400;
        return;
    }
    // Creamos el JWT. Si quisieras agregar distintos scopes, como por ejemplo
    // "admin", podrían hacer un llamado a la base de datos y cambiar el payload
    // en base a eso.
    const expirationSeconds = 1 * 60 * 60 * 24;
    const JWT_PRIVATE_KEY = process.env.JWT_SECRET;
    var token = jwt.sign(
        { scope: ['user'] },
        JWT_PRIVATE_KEY,
        { 
            subject: user.id.toString(),
            expiresIn: expirationSeconds
        }
    );
    ctx.body = {
        "access_token": token,
        "expires_in": expirationSeconds,
    }
    ctx.status = 200;

})


module.exports = router;