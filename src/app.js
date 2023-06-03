const Koa = require('koa');
const {koaBody} = require('koa-body');
const koaLogger = require('koa-logger');
// const cors = require("")
const router = require('./routes');
const orm = require('./models');
// const cors = require("@koa/cors");   

const app = new Koa();

app.context.orm = orm;

// Middlewear Koa
app.use(koaLogger());
app.use(koaBody());

// koa-router
app.use(router.routes());


module.exports = app;