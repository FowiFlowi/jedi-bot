const auth = require('./auth')
const session = require('./session')
const handleSceneEnter = require('./handleSceneEnter')

module.exports = bot => {
  bot.use(session)
  bot.use(handleSceneEnter)
  bot.use(auth)
}
