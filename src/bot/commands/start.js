const { commands: { start } } = require('config')

module.exports = [start, ctx => {
  const msg = `Hello, I'm ${ctx.botInfo.username}`
  return ctx.reply(msg)
}]
