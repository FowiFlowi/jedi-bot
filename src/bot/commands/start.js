const { scenes: { greeter }, commands } = require('config')

module.exports = [commands.start, (ctx, next) => {
  ctx.state.sceneName = greeter.self
  return next()
}]
