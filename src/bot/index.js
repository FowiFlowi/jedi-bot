const config = require('config')
const Telegraf = require('telegraf')

const commands = require('./commands')
const middlewares = require('./middlewares')

const bot = new Telegraf(config.botToken)


middlewares(bot)
commands(bot)

module.exports = bot
