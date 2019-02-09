const acl = require('./acl')
const session = require('./session')

module.exports = bot => {
  bot.use(acl)
  bot.use(session)
}
