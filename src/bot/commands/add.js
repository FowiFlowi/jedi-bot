const { commands } = require('config')

const directionService = require('../service/direction')
const protect = require('../middlewares/protect')

module.exports = [commands.add, protect.chat(), async ctx => {
  let [, name] = ctx.message.text.split(' ')
  name = name.trim()
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
