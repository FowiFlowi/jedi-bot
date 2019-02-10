const config = require('config')
const Telegraf = require('telegraf')

const commands = require('./commands')
const middlewares = require('./middlewares')
const scenes = require('./scenes')
const extendContext = require('./context')
const logger = require('../utils/logger')

const bot = new Telegraf(config.botToken)

extendContext(bot)

middlewares(bot)
commands(bot)
bot.use(scenes)

bot.catch(e => {
  logger.error(e)
  bot.telegram.sendMessage(config.creatorId, `Error: ${e.message}`)
})

module.exports = bot
