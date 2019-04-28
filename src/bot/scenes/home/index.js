const config = require('config')

const userService = require('../../service/user')
const directionService = require('../../service/direction')
const Scene = require('../../utils/scene')
const getKeyboard = require('../../utils/getKeyboard')
const protect = require('../../middlewares/protect')

const { scenes, buttons, roles } = config

const scene = new Scene(scenes.home.self)

scene.enter(ctx => {
  const keyboard = getKeyboard(ctx.state.user.roles)
  return ctx.replyWithHTML(ctx.state.homeMessage, keyboard)
})

scene.hears(buttons.home.student.becomeMentor, protect(roles.student),
  ctx => ctx.scene.enter(scenes.greeter.mentorRequest, { upgrade: true }))

scene.hears(buttons.home.mentor.addDirection, protect(roles.mentor),
  ctx => ctx.scene.enter(scenes.home.addMentorDirection))

scene.hears(buttons.home.mentor.removeDirection, protect(roles.mentor),
  async ctx => ctx.scene.enter(scenes.home.removeMentorDirection))

scene.hears(buttons.home.mentor.myDirections, protect(roles.mentor), async ctx => {
  const { directions = [], mentorRequests } = ctx.state.user
  const ids = directions.map(item => item.id)
  const list = await directionService.get({ ids, format: true })
  const unapproved = userService.extractUnapprovedList(mentorRequests)
  let answer = ''
  if (list.length) {
    answer += `<b>Підтвердженні напрями:</b>\n${list}`
  }
  if (unapproved.length) {
    answer += `\n\n<b>Непідтвердженні напрями:</b>\n${unapproved}`
  }
  const messageIfEmpty = 'У тебе намає жодних напрямів :c\nСкоріше додай нових!'
  return ctx.replyWithHTML(answer || messageIfEmpty)
})

scene.hears(buttons.home.mentor.mentors, protect(roles.mentor),
  async ctx => ctx.scene.enter(scenes.home.otherMentors))

scene.hears(buttons.home.student.searchMentors, protect(roles.student),
  async ctx => ctx.scene.enter(scenes.home.searchMentors))

scene.on('text', ctx => ctx.home('Скористуйся кнопками'))

module.exports = scene
