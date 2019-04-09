const logger = require('../../utils/logger')
const extractUsername = require('../utils/extractUsername')

module.exports = async (ctx, next) => {
  ctx.state.prevSceneName = ctx.session.__scenes && ctx.session.__scenes.current
  await next()
  const endTime = new Date()
  const requestTime = `${endTime - ctx.state.requestStartTime}ms`
  if (ctx.message && ctx.message.text) {
    const currentSceneName = ctx.session.__scenes && ctx.session.__scenes.current
    const prefix = ctx.state.prevSceneName !== currentSceneName ? `[${ctx.state.prevSceneName}->${currentSceneName}]` : `[${currentSceneName}]`
    logger.info(`${requestTime}:${prefix}${extractUsername(ctx.state.user)} ${ctx.message.text}`)
  } else {
    logger.info(`Request time: ${requestTime}`)
  }
}
