const { commands, roles } = require('config')

const protect = require('../middlewares/protect')
const userService = require('../service/user')

module.exports = [commands.selfremove, protect(roles.developer), async ctx => {
  await userService.remove(ctx.from.id)
  ctx.reply('Removed')
}]
