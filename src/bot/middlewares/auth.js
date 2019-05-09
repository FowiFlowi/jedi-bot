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
  if (!ctx.from) {
    return false
  }
  const userData = { ...mapFromUser(ctx.from), removedBot: false }
  const { user, updated } = await userService.upsert(userData)
  if (user.roles && user.roles.includes(config.roles.mentor) && !user.username) {
    return ctx.replyWithHTML(config.messages.shouldMentorUsername)
  }
  if (!updated && !(ctx.message && ctx.message.text && ctx.message.text.startsWith('/start'))) {
    ctx.state.sceneName = config.scenes.greeter.self
  }
  ctx.state.user = user
  if (ctx.callbackQuery) {
    return next()
  }
  if (!ctx.message || !ctx.message.text) {
    return false
  }
  return env.isDev()
    ? await settingsService.checkAcl(ctx.from.id) && next()
    : next()
}
