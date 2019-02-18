const { commands } = require('config')

const userService = require('../service/user')
const protect = require('../middlewares/protect')
const extractUsername = require('../utils/extractUsername')

module.exports = [commands.directions, protect.chat(), async ctx => {
  const [, tgId] = ctx.message.text.split(' ')
  if (!tgId) {
    return ctx.reply('Provide telegram id to remove user')
  }
  const removedUser = await userService.remove(tgId.trim())
  if (!removedUser) {
    return ctx.reply('No user with such telegram id')
  }
  return ctx.reply(`Removed ${extractUsername(removedUser)}`)
}]
