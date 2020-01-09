function composeMiddlewares(middlewares) {
    return function wrapMiddlewares(ctx) {
        // 记录当前运行的middleware的下标
        let index = -1;
        function dispatch(i) {
            // index向后移动
            index = i;
            // 最后一个中间件调用next 也不会报错
            const fn = middlewares[i];
            if (!fn)
                return Promise.resolve();
            return Promise.resolve(fn(
            // 继续传递ctx
            ctx, 
            // next方法，允许进入下一个中间件。
            () => dispatch(i + 1)));
        }
        // 开始运行第一个中间件
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
        // 组合中间件
        const composed = composeMiddlewares(this.middlewares);
        // 初始化ctx
        const ctx = { req, res: undefined };
        return composed(ctx);
    }
}
const app = new Koa();
// 最外层 管控全局错误
app.use(async (ctx, next) => {
    try {
        // 这里的next包含了第二层以及第三层的运行
        await next();
    }
    catch (error) {
        console.log(`[koa error]: ${error.message}`);
    }
});
// 第二层 日志中间件
app.use(async (ctx, next) => {
    const { req } = ctx;
    console.log(`req is ${JSON.stringify(req)}`);
    await next();
    // next过后已经能拿到第三层写进ctx的数据了
    console.log(`res is ${JSON.stringify(ctx.res)}`);
});
// 第三层 核心服务中间件
// 在真实场景中 这一层一般用来构造真正需要返回的数据 写入ctx中
app.use(async (ctx, next) => {
    const { req } = ctx;
    console.log(`calculating the res of ${req}...`);
    const res = {
        code: 200,
        result: `req ${req} success`,
    };
    // 写入ctx
    ctx.res = res;
    await next();
});
// 用来测试全局错误中间件
// 注释掉这一个中间件 服务才能正常响应
// app.use(async (ctx, next) => {
//     throw new Error('oops! error!');
// });
app.start({ req: 'ssh' });
