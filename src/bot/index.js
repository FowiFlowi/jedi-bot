const config = require('config')
const Telegraf = require('telegraf')

const commands = require('./commands')
const middlewares = require('./middlewares')
const scenes = require('./scenes')
const extendContext = require('./context')

const bot = new Telegraf(config.botToken)

extendContext(bot)

middlewares(bot)
commands(bot)
bot.use(scenes)

module.exports = bot
