const { commands } = require('config')

const directionService = require('../service/direction')
const protect = require('../middlewares/protect')

module.exports = [commands.directions, protect.chat(), async ctx => {
  const directions = await directionService.get({ format: true, markHasMentors: true })
  return ctx.replyWithHTML(directions)
}]
