function composeMiddlewares(middlewares) {
    return function wrapMiddlewares(ctx) {
        let index = -1;
        function dispatch(i) {
            index = i;
            const fn = middlewares[i];
            if (!fn)
                return Promise.resolve();
            return Promise.resolve(fn(ctx, () => dispatch(i + 1)));
        }
        return dispatch(0);
    };
}
class Koa {
    constructor() {
        this.middlewares = [];
    }
    use(middleware) {
        this.middlewares.push(middleware);
    }
    start({ req }) {
        const composed = composeMiddlewares(this.middlewares);
        const ctx = { req, res: undefined };
        return composed(ctx);
    }
}
const app = new Koa();
// log middleware
app.use(async (ctx, next) => {
    const { req } = ctx;
    console.log(`req is ${JSON.stringify(req)}`);
    await next();
    console.log(`res is ${JSON.stringify(ctx.res)}`);
});
// service middleware
app.use(async (ctx) => {
    const { req } = ctx;
    console.log(`calculating the res of ${req}...`);
    const res = {
        code: 200,
        result: `req ${req} success`,
    };
    // 写入ctx
    ctx.res = res;
});
app.start({ req: 'ssh' });
