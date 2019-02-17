const config = require('config')

const Scene = require('../../../utils/scene')
const userService = require('../../../service/user')
const chooseDirectionHandler = require('../../../utils/chooseDirectionHandler')

const scene = new Scene(config.scenes.home.addDirection)

const sceneMessage = `Тут можеш додати ще направлень, котрі ти б хотів менторити.
Вибери порядковий номер зі списку, або запропонуй свій та дочекайся підтвердження`

scene.enter(chooseDirectionHandler(sceneMessage))

scene.hears(config.buttons.back, ctx => ctx.home('Іншим разом'))

scene.on('text', async ctx => {
  const num = parseInt(ctx.message.text, 10)
  const dbDirection = ctx.scene.state.directions[num - 1]
  if (!dbDirection) {
    const newDirection = ctx.message.text.trim()
    await userService.addMentorRequest(ctx.from.id, newDirection)
    return ctx.home('Готово, залишилось тільки дочекатись підтвердження')
  }
  const { directions: userDirections = [] } = ctx.state.user
  const hasUserDirection = userDirections
    .find(({ id }) => id.toString() === dbDirection._id.toString())
  if (hasUserDirection) {
    return ctx.reply('У тебе вже є це направлення, вибери інше')
  }

  const modifier = { $addToSet: { directions: { id: dbDirection._id } } }
  ctx.state.user = await userService.update(ctx.from.id, modifier, { disableSetWrapper: true })
  return ctx.home('Готово') // TODO: виводити оновлений список направлень
})

module.exports = scene
