const Koa = require("koa");
const swagger = require("swagger2");
const { validate: swaggerValidate } = require("swagger2-koa");
const { koaSwagger } = require("koa2-swagger-ui");
const { koaBody } = require("koa-body");
const koaLogger = require("koa-logger");
// const cors = require("")
const router = require("./routes");
const orm = require("./models");
// const cors = require("@koa/cors");

const swaggerDocument = swagger.loadDocumentSync("api.yaml");
const app = new Koa();

app.context.orm = orm;

// Middleware Koa
app.use(koaLogger());
app.use(koaBody());

// Swagger
app.use(koaSwagger({
    routePrefix: '/docs',
    swaggerOptions: {
        swaggerDocument
    },
}));
app.use(swaggerValidate(swaggerDocument));

// koa-router
app.use(router.routes());

module.exports = app;
