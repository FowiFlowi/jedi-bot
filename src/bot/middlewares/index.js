const auth = require('./auth')
const Session = require('./session')
const errorHandler = require('./errorHandler')
const handleSceneEnter = require('./handleSceneEnter')
const logger = require('./logger')
const db = require('../../db')
const getSessionKey = require('../utils/getSessionKey')

const session = new Session({ db, getSessionKey })

module.exports = bot => {
  bot.use(errorHandler, session, handleSceneEnter, auth, logger)
}
