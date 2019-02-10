const { commands, roles } = require('config')

const protect = require('../middlewares/protect')
const userService = require('../service/user')
const sessionService = require('../service/session')

module.exports = [commands.selfremove, protect(roles.developer), async ctx => {
  const tasks = [
    userService.remove(ctx.from.id),
    sessionService.remove(ctx.state.sessionKey),
  ]
  await Promise.all(tasks)
  ctx.reply('Removed')
}]
