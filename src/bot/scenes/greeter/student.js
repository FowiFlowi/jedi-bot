const config = require('config')
const env = require('node-env-manager')

const Scene = require('../../utils/scene')
const userService = require('../../service/user')
const chooseDirectionHandler = require('../../utils/chooseDirectionHandler')

const scene = new Scene(config.scenes.greeter.student)

scene.enter(chooseDirectionHandler('Вибери порядковий номер одного з направлень:', { hasMentors: true }))

scene.hears(config.buttons.back, ctx => {
  ctx.state.sceneMessage = 'Спробуй ще'
  ctx.scene.enter(config.scenes.greeter.self)
})

scene.on('text', async ctx => {
  const num = parseInt(ctx.message.text, 10)
  const direction = ctx.scene.state.directions[num - 1]
  if (!direction) {
    return ctx.reply('Щось не той номер ти вибрав. Спробуй ще')
  }
  const data = {
    directions: [{ id: direction._id }],
    roles: [config.roles.student],
  }
  if (env.isDev()) {
    data.roles.push(config.roles.developer)
  }
  ctx.state.user = await userService.update(ctx.from.id, data)
  return ctx.home('Вже можеш починати шукати менторів. Щасти!')
})

module.exports = scene
