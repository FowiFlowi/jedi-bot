const config = require('config')
const Scene = require('telegraf/scenes/base')

const getKeyboard = require('../../utils/getKeyboard')

const { scenes } = config

const scene = new Scene(scenes.home.self)

scene.enter(ctx => {
  const keyboard = getKeyboard(ctx.state.user.roles)
  return ctx.replyWithHTML(ctx.state.homeMessage, keyboard)
})

scene.on('text', ctx => {
  const msg = 'Незабаром...'
  return ctx.reply(msg)
})

module.exports = scene
