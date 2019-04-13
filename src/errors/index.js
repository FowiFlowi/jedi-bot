const CustomError = require('./CustomError')

module.exports = {
  badRequest(msg) {
    const error = new CustomError(msg)
    error.status = 400
    throw error
  },
  logonFailed(msg) {
    const error = new CustomError(msg)
    error.status = 403
    throw error
  },
  notFound(msg) {
    const error = new CustomError(msg)
    error.status = 404
    throw error
  },
  bot: {
    noDirection(msg = 'No direction was found') {
      throw new CustomError(msg)
    },
    noUsers(msg = 'No users were found') {
      throw new CustomError(msg)
    },
    noUnapprovedRequest(msg = 'No unapproved requests were found') {
      throw new CustomError(msg)
    },
    noRequestQuestion(msg = 'No request question was found') {
      throw new CustomError(msg)
    },
  },
}
