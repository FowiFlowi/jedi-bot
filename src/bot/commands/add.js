const { commands } = require('config')

const directionService = require('../service/direction')
const protect = require('../middlewares/protect')

module.exports = [commands.add, protect.chat(), async ctx => {
  const [, ...nameArray] = ctx.message.text.split(' ')
  const name = nameArray.join(' ').trim()
  if (!name) {
    return ctx.reply('Provide direction name, plaese')
  }
  try {
    await directionService.insert(name)
  } catch (e) {
    if (e.code === 11000) {
      return ctx.reply('This direction already exists!')
    }
    throw e
  }
  return ctx.reply('Added')
}]
