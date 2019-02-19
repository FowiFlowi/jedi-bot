const config = require('config')

module.exports = async (ctx, next) => {
  try {
    await next()
  } catch (e) {
    ctx.replyWithAnimation(config.videos.error)
    ctx.telegram.sendMessage(config.creatorId, `Error: ${e.message}`)
  }
}
