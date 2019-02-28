const env = require('node-env-manager')

const CustomError = require('../errors/CustomError')

if (!('toJSON' in Error.prototype)) {
  Object.defineProperty(Error.prototype, 'toJSON', { // eslint-disable-line no-extend-native
    value() {
      const alt = {}
      Object.getOwnPropertyNames(this).forEach(key => {
        alt[key] = this[key]
      }, this)
      return alt
    },
    configurable: true,
    writable: true,
  })
}

module.exports = async (ctx, next) => {
  try {
    return await next()
  } catch (e) {
    e.status = e.status || 500
    ctx.status = e.status
    if (e instanceof CustomError) {
      return ctx.message = e.message
    }
    if (env.isLocal() || env.isDev()) {
      ctx.body = e
    }
    return ctx.app.emit('error', e)
  }
}
