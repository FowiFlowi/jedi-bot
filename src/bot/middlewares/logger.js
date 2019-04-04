const logger = require('../../utils/logger')
const extractUsername = require('../utils/extractUsername')

module.exports = async (ctx, next) => {
  ctx.state.prevSceneName = ctx.session.__scenes && ctx.session.__scenes.current
  await next()
  if (ctx.message && ctx.message.text) {
    const currentSceneName = ctx.session.__scenes && ctx.session.__scenes.current
    const prefix = ctx.state.prevSceneName !== currentSceneName ? `[${ctx.state.prevSceneName}->${currentSceneName}]` : `[${currentSceneName}]`
    logger.info(`${prefix}${extractUsername(ctx.state.user)} ${ctx.message.text}`)
  }
}
