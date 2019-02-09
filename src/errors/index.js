const AppError = require('./AppError')

module.exports = {
  badRequest(msg) {
    const error = new AppError(msg)
    error.status = 400
    throw error
  },
  logonFailed(msg) {
    const error = new AppError(msg)
    error.status = 403
    throw error
  },
  notFound(msg) {
    const error = new AppError(msg)
    error.status = 404
    throw error
  },
}
