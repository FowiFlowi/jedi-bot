const { scenes, roles, buttons } = require('config')
const env = require('node-env-manager')
const WizardScene = require('telegraf/scenes/wizard')
const Composer = require('telegraf/composer')

const userService = require('../../service/user')
const sceneBaseHandler = require('../../utils/sceneBaseHandler')
const chooseDirectionHandler = require('../../utils/chooseDirectionHandler')

const backHandler = ctx => {
  ctx.state.sceneMessage = 'Спробуй ще разок'
  return ctx.scene.state.upgrade
    ? ctx.home('Іншим разом')
    : ctx.scene.enter(scenes.greeter.self)
}

const stepHandler = (question, answerProperty) => {
  const composer = new Composer(sceneBaseHandler)

  composer.hears(buttons.back, backHandler)

  composer.on('text', ctx => {
    const answer = ctx.message.text.trim()
    const { answerProperty: prevAnswerProp } = ctx.scene.state
    ctx.scene.state.answers[prevAnswerProp] = answer
    ctx.scene.state.answerProperty = answerProperty
    ctx.replyWithHTML(question)
    return ctx.wizard.next()
  })
  return composer
}

const sceneMessage = 'Чудово!\nКотре направлення ти б хотів менторити?\n'
  + 'Вибери порядковий номер або запропонуй свій варіант'

const scene = new WizardScene(scenes.greeter.mentorRequest,
  chooseDirectionHandler(sceneMessage),
  async ctx => {
    if (ctx.message.text === buttons.back) {
      return backHandler(ctx)
    }
    const num = parseInt(ctx.message.text, 10)
    const dbDirection = ctx.scene.state.directions[num - 1]
    if (!dbDirection) {
      ctx.scene.state.isNewDirection = true
    }
    ctx.scene.state.answers = {
      direction: dbDirection ? dbDirection.name : ctx.message.text.trim(),
    }
    const text = 'Ще одне: мені важливо, аби відповіді на питання були українскьою, '
      + 'адже це мова мого інтерфейсу\n\n<b>Який у тебе досвід?</b>'
    ctx.replyWithHTML(text)
    ctx.scene.state.answerProperty = 'experience'
    return ctx.wizard.next()
  },
  stepHandler('<b>Скільки годин на день плануєш виділяти на менторство?</b>', 'timeAmount'),
  stepHandler('<b>Маєш можливість зустрічатись офлайн?</b>', 'offline'),
  stepHandler('<b>Місто</b>', 'city'),
  stepHandler('У ментора повинен бути профіль в LinkedIn, аби студентам було легше орієнтуватись. '
    + 'Тож радимо перевірити актуальність своєї сторінки\n\n<b>Посилання на linkedin</b>', 'linkedin'),
  async ctx => {
    if (ctx.message.text === buttons.back) {
      return backHandler(ctx)
    }
    const { answerProperty: prevAnswerProp } = ctx.scene.state
    ctx.scene.state.answers[prevAnswerProp] = ctx.message.text.trim()

    const request = { answers: ctx.scene.state.answers, approved: false }
    if (ctx.scene.state.isNewDirection) {
      request.isNewDirection = true
    }
    request.newRequestMsgId = await userService.notifyNewRequest(ctx.state.user, request)

    const data = {
      mentorRequests: [request],
      roles: [roles.mentor],
    }
    if (env.isDev()) {
      data.roles.push(roles.developer)
    }
    const ops = { unset: { directions: 1 } }
    ctx.state.user = await userService.update(ctx.from.id, data, ops)
    return ctx.home('Готово!\nЗалишилось дочекатись підтвердження від адміністраторів. Я от-от тебе сповіщу про це')
  })

module.exports = scene
