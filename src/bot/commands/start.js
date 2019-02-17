const { scenes: { greeter }, commands } = require('config')

module.exports = [commands.start, (ctx, next) => {
  if (ctx.state.user && ctx.state.user.roles && ctx.state.user.roles.length) {
    ctx.homePass('Починай :)')
    return next()
  }
  ctx.state.sceneName = greeter.self
  return next()
}]
