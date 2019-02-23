const { commands } = require('config')

const protect = require('../middlewares/protect')

module.exports = [commands.editRequest, protect.chat(), async ctx => {
  const message = 'soon'
  return ctx.reply(message)
}]
