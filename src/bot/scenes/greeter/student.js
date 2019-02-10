const config = require('config')
const Scene = require('telegraf/scenes/base')
const { Markup } = require('telegraf')
const env = require('node-env-manager')

const directionService = require('../../service/direction')
const userService = require('../../service/user')
const sceneBaseHandler = require('../../utils/sceneBaseHandler')

const scene = new Scene(config.scenes.greeter.student, { handlers: [sceneBaseHandler] })

scene.enter(async ctx => {
  const directions = await directionService.get()
  ctx.scene.session.directions = directions
  const msg = `Вибери порядковий номер одного з направлень:\n\n${directionService.format(directions)}`
  return ctx.replyWithHTML(msg, Markup.removeKeyboard().extra())
})

scene.on('text', async ctx => {
  const num = parseInt(ctx.message.text, 10)
  const direction = ctx.scene.session.directions[num - 1]
  if (!direction) {
    return ctx.reply('Щось не той номер ти вибрав. Спробуй ще')
  }
  const data = {
    directions: [direction._id],
    roles: [config.roles.student],
  }
  if (env.isDev()) {
    data.roles.push(config.roles.developer)
  }
  ctx.state.user = await userService.update(ctx.from.id, data)
  return ctx.home('Вже можеш починати шукати менторів. Щасти!')
})

module.exports = scene
