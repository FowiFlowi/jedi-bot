const acl = require('./acl')

module.exports = bot => {
  bot.use(acl)
}
