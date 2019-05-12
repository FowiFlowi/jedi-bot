const logger = require('../../utils/logger')
const extractUsername = require('../utils/extractUsername')

const getSceneLog = (prevSceneName, currentSceneName) => prevSceneName
  && (prevSceneName !== currentSceneName ? `[${prevSceneName}->${currentSceneName}]` : `[${currentSceneName}]`)

module.exports = async (ctx, next) => {
  if (ctx.callbackQuery) {
    console.log({
      cb: ctx.callbackQuery,
      user: ctx.state.user,
    })
  }
  ctx.state.prevSceneName = ctx.session.__scenes && ctx.session.__scenes.current
  await next()
  const endTime = new Date()
  const requestTime = `${endTime - ctx.state.requestStartTime}ms`
  if (ctx.message && ctx.message.text) {
    const currentSceneName = ctx.session.__scenes && ctx.session.__scenes.current
    const sceneLog = getSceneLog(ctx.state.prevSceneName, currentSceneName)
    logger.info(`${requestTime}:${sceneLog || ''}${extractUsername(ctx.state.user)} ${ctx.message.text}`)
  } else {
    logger.info(`Request time: ${requestTime}`)
  }
}
