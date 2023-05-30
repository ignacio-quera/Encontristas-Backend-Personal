import koa from "koa";
import koaLogger from "koa-logger";
import { koaBody } from "koa-body";
import router from "./routes.jss";

const app = new koa();

// Middlewear Koa
app.use(koaLogger());
app.use(koaBody());

// koa-router
app.use(router.routes());

app.listen(3001, () => {
    console.log("Iniciando servidor. Escuchando en puerto 3001.")
});