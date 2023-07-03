const Koa = require("koa");
const swagger = require("swagger2");
const { validate: swaggerValidate } = require("swagger2-koa");
const { koaSwagger } = require("koa2-swagger-ui");
const { koaBody } = require("koa-body");
const koaLogger = require("koa-logger");
const router = require("./routes");
const orm = require("./models");
const cors = require("@koa/cors");

const swaggerDocument = swagger.loadDocumentSync("api.yaml");
// if (!swagger.validateDocument(swaggerDocument)) {
//   throw Error(`./api.yml does not conform to the OpenAPI schema`);
// }

const app = new Koa();

app.keys = ['some secret hurr'];

app.context.orm = orm;

// Middleware Koa
app.use(cors());
app.use(koaLogger());
app.use(koaBody());

// Session Manager
// app.use(session(app));

// Swagger
app.use(koaSwagger({
  routePrefix: "/docs",
  swaggerOptions: {
    spec: swaggerDocument,
  },
}));
// app.use(swaggerValidate(swaggerDocument));

// koa-router
app.use(router.routes()).use(router.allowedMethods());

module.exports = app;
