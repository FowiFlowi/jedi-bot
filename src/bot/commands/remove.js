const { commands } = require('config')

const userService = require('../service/user')
const directionService = require('../service/direction')
const protect = require('../middlewares/protect')
const extractUsername = require('../utils/extractUsername')
const regexpCollection = require('../utils/regexpCollection')

module.exports = [commands.remove, protect.chat(), async ctx => {
  const [, param] = ctx.message.text.split(' ')
  if (!param) {
    return ctx.reply('Provide telegram id or direction name to remove docuemnt')
  }
  if (regexpCollection.tgId.test(param)) {
    const tgId = param.trim()
    const removedUser = await userService.remove(tgId)
    if (!removedUser) {
      return ctx.reply('No user with such telegram id')
    }
    return ctx.reply(`Removed ${extractUsername(removedUser)}`)
  }
  const directionName = param.trim()
  await directionService.removeByName(directionName, { removeFromUsers: true })
  return ctx.reply('Removed direction')
}]
