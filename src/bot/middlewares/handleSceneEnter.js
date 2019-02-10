module.exports = async (ctx, next) => {
  await next()
  if (ctx.state.sceneName) {
    ctx.scene.enter(ctx.state.sceneName)
  }
}
