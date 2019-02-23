const logger = require('../../utils/logger')
const extractUsername = require('../utils/extractUsername')

module.exports = async (ctx, next) => {
  const prevScene = ctx.session.__scenes && ctx.session.__scenes.current
  if (ctx.message && ctx.message.text) {
    const username = extractUsername(ctx.state.user)
    logger.info(`[${(prevScene || '')}]${username} ${ctx.message.text}`)
  }
  await next()
  const currentScene = ctx.session.__scenes && ctx.session.__scenes.current
  if (prevScene !== currentScene) {
    logger.info(`Next scene: ${currentScene || ''}`)
  }
}
