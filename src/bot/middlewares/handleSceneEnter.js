module.exports = async (ctx, next) => {
  await next()
  return ctx.state.sceneName && ctx.scene.enter(ctx.state.sceneName)
}
