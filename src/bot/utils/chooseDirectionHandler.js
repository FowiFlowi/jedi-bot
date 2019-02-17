const config = require('config')
const { Markup } = require('telegraf')

const directionService = require('../service/direction')

module.exports = (listMessage, ops = {}) => async ctx => {
  const directions = await directionService.get(ops)
  ctx.scene.state.directions = directions
  const msg = `${listMessage}\n\n${directionService.format(directions)}`
  const keyboard = Markup.keyboard([config.buttons.back]).resize().extra()
  ctx.replyWithHTML(msg, keyboard)
  if (ctx.wizard) {
    ctx.wizard.next()
  }
}
