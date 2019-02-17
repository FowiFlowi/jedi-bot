const auth = require('./auth')
const Session = require('./session')
const handleSceneEnter = require('./handleSceneEnter')
const db = require('../../db')

const session = new Session({ db })

module.exports = bot => {
  bot.use(session)
  bot.use(handleSceneEnter)
  bot.use(auth)
}
