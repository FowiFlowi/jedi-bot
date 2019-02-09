const config = require('config')
const Telegraf = require('telegraf')

const bot = new Telegraf(config.botToken)

bot.start(ctx => {
  const msg = `Hello, I'm ${ctx.botInfo.username}`
  return ctx.reply(msg)
})

module.exports = bot
