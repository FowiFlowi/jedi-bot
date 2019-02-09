const config = require('config')
const Telegraf = require('telegraf')

const commands = require('./commands')

const bot = new Telegraf(config.botToken)

commands(bot)

module.exports = bot
