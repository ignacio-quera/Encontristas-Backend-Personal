const Router = require('koa-router');

const router = new Router();

router.post("users.create","/",async(ctx)=>{
    try{
        ctx.body = ctx.request.body;
        const user = await ctx.orm.User.create(ctx.request.body);
        ctx.body = user; 
        ctx.status = 201;
    } catch(error){
        ctx.body = error;
        ctx.status = 400;
    }
})


router.get("users.list","/",async(ctx)=>{
    try{
        const users = await ctx.orm.User.findAll();
        ctx.body = users;
        ctx.status = 200;
    } catch(error){
        ctx.body = error;
        ctx.status = 400;
    }
})

router.get("users.show","/:id", async(ctx)=>{
    try{
        const user = await ctx.orm.User.findByPk(ctx.params.id);
        ctx.body = user;
        ctx.status = 200;
    } catch(error){
        ctx.body = error;
        ctx.status = 400;
    }
})

router.put("users.edit","/:id", async(ctx)=>{
    try{
        const id = ctx.params.id;
        const {username, password, mail} = ctx.request.body;
        const user = await ctx.orm.User.findByPk(id);
        await user.update({
            username: username,
            password: password,
            mail: mail,
          });
        ctx.body = user;
        ctx.status = 201;
    } catch(error){
        ctx.body = error;
        ctx.status = 400;
    }
})

module.exports = router;