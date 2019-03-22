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

scene.hears(buttons.home.student.becomeMentor, protect(roles.student), ctx => {
  const sceneName = scenes.greeter.mentorRequest
  return ctx.scene.enter(sceneName)
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

scene.hears(buttons.home.mentor.removeDirection, protect(roles.mentor),
  async ctx => ctx.scene.enter(scenes.home.removeMentorDirection))

scene.hears(buttons.home.mentor.myDirections, protect(roles.mentor, roles.student), async ctx => {
  const { directions = [], roles: userRoles, mentorRequests } = ctx.state.user
  const ids = directions.map(item => item.id)
  const list = await directionService.get({ ids, format: true })
  const messageIfEmpty = 'У тебе намає жодних направлень :c\nСкоріше додай нових!'
  if (userRoles.includes(roles.student)) {
    return ctx.replyWithHTML(list || messageIfEmpty)
  }

  const unapproved = userService.extractUnapprovedList(mentorRequests)
  let answer = ''
  if (list.length) {
    answer += `<b>Підтвердженні направлення:</b>\n${list}`
  }
  if (unapproved.length) {
    answer += `\n\n<b>Непідтвердженні направлення:</b>\n${unapproved}`
  }
  return ctx.replyWithHTML(answer || messageIfEmpty)
})

scene.hears(buttons.home.mentor.mentors, protect(roles.mentor),
  async ctx => ctx.scene.enter(scenes.home.otherMentors))

scene.hears(buttons.home.student.searchMentors, protect(roles.student),
  async ctx => ctx.scene.enter(scenes.home.searchMentors))

module.exports = scene
