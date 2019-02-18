const config = require('config')
const env = require('node-env-manager')

const settingsService = require('../service/settings')
const userService = require('../service/user')
const mapFromUser = require('../utils/mapFromUser')

module.exports = async (ctx, next) => {
  const { user, updated } = await userService.upsert(mapFromUser(ctx.from))
  ctx.state.user = user
  if (!updated && !ctx.message.text.match(/^\/start/)) {
    ctx.state.sceneName = config.scenes.greeter.self
  }
  if (!env.isDev()) {
    return next()
  }
  if (ctx.from && await settingsService.checkAcl(ctx.from.id)) {
    return next()
  }
  return false
}
