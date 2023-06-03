const Router = require('koa-router');

const router = new Router();

router.post("users.create","/",async(ctx)=>{
    try{
        const user = await ctx.orm.User.create(ctx.request.body);
        ctx.body = user;
        ctx.status = 201;
    } catch(error){
        ctx.body = error;
        ctx.status = 400;
    }
})


module.exports = router;