const config = require('config')
const Telegraf = require('telegraf')

const bot = new Telegraf(config.botToken)
module.exports = bot

const commands = require('./commands')
const actions = require('./actions')
const middlewares = require('./middlewares')
const scenes = require('./scenes')
const extendContext = require('./context')
const logger = require('../utils/logger')

extendContext(bot)
middlewares(bot)
commands(bot)
actions(bot)
bot.use(scenes)

bot.catch(e => {
  logger.error(e)
  bot.telegram.sendMessage(config.creatorId, `Error: ${e.message}\n${JSON.stringify(e.stack)}`)
})
