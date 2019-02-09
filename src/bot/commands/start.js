const { commands, buttons } = require('config')
const { Markup } = require('telegraf')

module.exports = [commands.start, ctx => {
  const { mentor, student } = buttons.welcome
  const values = [mentor, student]
  const keyboard = Markup.keyboard(values, { columns: 2 }).resize().extra()
  const msg = `Hello, I'm ${ctx.botInfo.username}`
  return ctx.reply(msg, keyboard)
}]
