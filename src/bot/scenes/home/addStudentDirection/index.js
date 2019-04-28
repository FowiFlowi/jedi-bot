const config = require('config')
const env = require('node-env-manager')

const Scene = require('../../../utils/scene')
const userService = require('../../../service/user')
const chooseDirectionHandler = require('../../../utils/chooseDirectionHandler')

const scene = new Scene(config.scenes.home.addStudentDirection)

if (env.isDev()) {
  scene.enter(chooseDirectionHandler('Вибери порядковий номер одного з напрямів:'))
} else {
  scene.enter(chooseDirectionHandler('Вибери порядковий номер одного з напрямів:', { hasMentors: true }))
}

scene.hears(config.buttons.back, ctx => ctx.home('Іншим разом'))

scene.on('text', async ctx => {
  const num = parseInt(ctx.message.text, 10)
  const direction = ctx.scene.state.directions[num - 1]
  if (!direction) {
    return ctx.reply('Щось не той номер. Спробуй ще')
  }
  ctx.state.user = await userService.addDirection(ctx.from.id, direction._id)
  return ctx.home('Готово, залишилось не проґавити свого ментора')
})

module.exports = scene
