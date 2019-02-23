const config = require('config')
const env = require('node-env-manager')

const settingsService = require('../service/settings')
const userService = require('../service/user')
const mapFromUser = require('../utils/mapFromUser')

module.exports = async (ctx, next) => {
  if (ctx.chat.type !== 'private' && ctx.chat.id !== config.adminChatId) {
    const { username } = await ctx.telegram.getMe()
    ctx.reply(`Hey guys, text me privately, please: @${username}`)
    return ctx.leaveChat(ctx.chat.id)
  }
  const { user, updated } = await userService.upsert(mapFromUser(ctx.from))
  ctx.state.user = user
  if (!updated && (ctx.message && ctx.message.text && !ctx.message.text.match(/^\/start/))) {
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
