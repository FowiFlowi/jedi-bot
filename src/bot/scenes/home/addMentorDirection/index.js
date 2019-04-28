const config = require('config')
const WizardScene = require('telegraf/scenes/wizard')

const chooseDirectionHandler = require('../../../utils/chooseDirectionHandler')
const userService = require('../../../service/user')

const sceneMessage = 'Тут можеш додати ще напрямів, котрі ти б хотів менторити. '
  + 'Вибери порядковий номер зі списку або запропонуй свій варіант та дочекайся підтвердження'

const scene = new WizardScene(config.scenes.home.addMentorDirection,
  ctx => {
    const unapprovedRequest = ctx.state.user.mentorRequests
      .find(req => !req.approved && !req.disabled)
    if (unapprovedRequest) {
      const { direction } = unapprovedRequest.answers
      return ctx.home(`Спочатку дочекайся підтвердження по цьому напряму:\n<code>${direction}</code>`)
    }
    return chooseDirectionHandler(sceneMessage)(ctx)
  },
  async ctx => {
    if (ctx.message.text === config.buttons.back) {
      return ctx.home('Іншим разом')
    }
    const num = parseInt(ctx.message.text, 10)
    const dbDirection = ctx.scene.state.directions[num - 1]
    if (!dbDirection) {
      ctx.scene.state.isNewDirection = true
    }
    const directionName = dbDirection ? dbDirection.name : ctx.message.text.trim()
    const isUserAlreadyHasRequest = ctx.state.user.mentorRequests
      .filter(req => !req.disabled)
      .reduce((acc, { answers: { direction } }) => acc || direction === directionName, false)
    if (isUserAlreadyHasRequest) {
      return ctx.reply('В тебе вже є запит на цей напрям')
    }
    ctx.scene.state.answers = {
      direction: directionName,
    }
    ctx.replyWithHTML('<b>Кілька речень про твій досвід</b>')
    return ctx.wizard.next()
  },
  async ctx => {
    if (ctx.message.text === config.buttons.back) {
      return ctx.home('Іншим разом')
    }
    ctx.scene.state.answers.experience = ctx.message.text.trim()

    const request = { answers: ctx.scene.state.answers, approved: false }
    if (ctx.scene.state.isNewDirection) {
      request.isNewDirection = true
    }
    await userService.addMentorRequest(ctx.state.user, request)
    return ctx.home('Готово. Залишилось дочекатись підтвердження від адміністраторів. Вони от-от тобі напишуть')
  })

module.exports = scene
