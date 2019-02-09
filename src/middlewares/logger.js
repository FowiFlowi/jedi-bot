const logger = require('../utils/logger')

module.exports = (ctx, next) => {
  if (!ctx.path.startsWith('/bot')) {
    logger.info(ctx.method, ctx.path)
  }
  return next()
}
