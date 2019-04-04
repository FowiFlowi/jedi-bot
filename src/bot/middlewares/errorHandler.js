const config = require('config')

const logger = require('../../utils/logger')

module.exports = async (ctx, next) => {
  try {
    await next()
  } catch (e) {
    logger.error(e)
    if (ctx.state.user) {
      logger.error(ctx.state.user._id, ctx.state.prevSceneName)
    }
    ctx.reply('Не переймайся, ми вже працюємо над цим!')
    ctx.replyWithAnimation(config.videos.error)
    ctx.telegram.sendMessage(config.creatorId, `Error: ${e.message}\n${e.stack}`)
  }
}
