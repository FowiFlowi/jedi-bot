const { Composer } = require('telegraf')

const auth = require('./auth')
const Session = require('./session')
const handleSceneEnter = require('./handleSceneEnter')
const db = require('../../db')
const getSessionKey = require('../utils/getSessionKey')

const session = new Session({ db, getSessionKey })

module.exports = bot => {
  bot.use(Composer.privateChat(session, handleSceneEnter, auth))
}
