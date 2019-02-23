const config = require('config')

const userService = require('../../service/user')
const directionService = require('../../service/direction')
const Scene = require('../../utils/scene')
const getKeyboard = require('../../utils/getKeyboard')
const hasUserRole = require('../../utils/hasUserRole')
const protect = require('../../middlewares/protect')

const { scenes, buttons, roles } = config

const scene = new Scene(scenes.home.self)

scene.enter(ctx => {
  const keyboard = getKeyboard(ctx.state.user.roles)
  return ctx.replyWithHTML(ctx.state.homeMessage, keyboard)
})

scene.hears(buttons.home.mentor.addDirection, protect(roles.mentor, roles.student),
  ctx => {
    if (hasUserRole(ctx.state.user, roles.mentor)) {
      return ctx.scene.enter(scenes.home.addMentorDirection)
    }
    if (hasUserRole(ctx.state.user, roles.student)) {
      return ctx.scene.enter(scenes.home.addStudentDirection)
    }
    return false
  })

scene.hears(buttons.home.mentor.myDirections, protect(roles.mentor, roles.student), async ctx => {
  const { directions = [], roles: userRoles, mentorRequests } = ctx.state.user
  const ids = directions.map(item => item.id)
  const list = await directionService.get({ ids, format: true })
  const messageIfEmpty = 'У тебе намає жодних направлень :c\nСкоріше додай нових!'
  if (userRoles.includes(roles.student)) {
    return ctx.replyWithHTML(list || messageIfEmpty)
  }

  const unapproved = mentorRequests
    .filter(request => request.approved === false)
    .map((request, indx) => `${indx + 1}. <code>${request.answers.direction}</code>`)
    .join('\n')

  let answer = ''
  if (list.length) {
    answer += `<b>Підтвердженні направлення:</b>\n${list}`
  }
  if (unapproved.length) {
    answer += `\n\n<b>Непідтвердженні направлення:</b>\n${unapproved}`
  }
  return ctx.replyWithHTML(answer || messageIfEmpty)
})

scene.hears(buttons.home.student.mentors, protect(roles.student), async ctx => {
  const text = await userService.getMentorsByDirections(ctx.state.user.directions, { format: true })
  const messageIfEmpty = 'По твоїх направленнях поки немає менторів, але вони незабаром прийдуть.\n'
    + 'Спробуй додати інших направлень'
  return ctx.replyWithHTML(text || messageIfEmpty)
})

module.exports = scene
