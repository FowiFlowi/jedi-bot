const { scenes, roles, buttons } = require('config')
const env = require('node-env-manager')
const WizardScene = require('telegraf/scenes/wizard')
const Composer = require('telegraf/composer')
const { Markup } = require('telegraf')

const userService = require('../../service/user')
const sceneBaseHandler = require('../../utils/sceneBaseHandler')

const stepHandler = (message, prevAnswerProperty) => {
  const composer = new Composer(sceneBaseHandler)
  composer.on('text', ctx => {
    const answer = ctx.message.text.trim()
    if (answer === buttons.cancel) {
      ctx.state.sceneMessage = 'Спробуй ще разок'
      ctx.scene.enter(scenes.greeter.self)
    }
    if (!answer) {
      return ctx.reply('Ну ж бо, напиши хоч щось')
    }
    ctx.scene.state.answers[prevAnswerProperty] = answer
    ctx.replyWithHTML(message)
    return ctx.wizard.next()
  })
  return composer
}


const scene = new WizardScene(scenes.greeter.mentorRequest,
  ctx => {
    const message = 'Аби стати ментором, тобі знадобиться заповнити коротку анкету'
      + '\n\nПерше питання: <b>котре направлення ти би хотів менторити?</b>'
    const keyboard = Markup.keyboard([buttons.cancel]).resize().extra()
    ctx.replyWithHTML(message, keyboard)

    ctx.scene.state.answers = {}
    return ctx.wizard.next()
  },
  stepHandler('<b>Який у тебе досвід?</b>', 'direction'),
  stepHandler('<b>Скільки часу плануєш виділяти на менторство?</b>', 'timeAmount'),
  stepHandler('<b>Посилання на linkedin</b>', 'linkedin'),
  async ctx => {
    const data = {
      mentorRequests: [{ answers: ctx.scene.state.answers, approved: false }],
      roles: [roles.mentor],
    }
    if (env.isDev()) {
      data.roles.push(roles.developer)
    }
    ctx.state.user = await userService.update(ctx.from.id, data)
    ctx.home('Готово. Залишилось дочекатись підтвердження від адміністраторів. Вони от-от тобі напишуть')
  })

module.exports = scene
