const lodash = require('lodash')

module.exports = patch => {
  patch.version('2.0.2')

  const query = { directions: { $exists: true } }
  patch.update('users', query, (user, cb) => {
    const modifier = { $set: { viewedDirections: user.directions } }
    cb(null, modifier)
  })

  patch.after((update, callback) => {
    const isValid = lodash.isEqual(update.after.viewedDirections, update.before.directions)

    callback(isValid ? null : new Error('Update failed'))
  })
}
