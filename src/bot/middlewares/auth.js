const env = require('node-env-manager')

const settingsService = require('../service/settings')
const userService = require('../service/user')
const mapFromUser = require('../utils/mapFromUser')

module.exports = async (ctx, next) => {
  ctx.state.user = await userService.upsert(mapFromUser(ctx.from))
  if (!env.isDev()) {
    return next()
  }
  if (ctx.from && await settingsService.checkAcl(ctx.from.id)) {
    return next()
  }
  return false
}
