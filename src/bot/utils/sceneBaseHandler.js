module.exports = (ctx, next) => !ctx.state.sceneName && next()
