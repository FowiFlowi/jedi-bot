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
  bot: {
    noDirection(msg = 'No direction was found') {
      throw new AppError(msg)
    },
    noUsers(msg = 'No users was found') {
      throw new AppError(msg)
    },
    noUnapprovedRequest(msg = 'No unapproved requests was found') {
      throw new AppError(msg)
    },
    noRequestQuestion(msg = 'No request question was found') {
      throw new AppError(msg)
    },
  },
}
