const config = require('config')

const userService = require('../../service/user')
const directionService = require('../../service/direction')
const Scene = require('../../utils/scene')
const getKeyboard = require('../../utils/getKeyboard')
const protect = require('../../middlewares/protect')

const {
  scenes, buttons, roles, requestStatuses,
} = config

const scene = new Scene(scenes.home.self)

scene.enter(ctx => {
  const keyboard = getKeyboard.home(ctx.state.user.roles)
  return ctx.replyWithHTML(ctx.state.homeMessage, keyboard)
})

scene.hears(buttons.home.student.becomeMentor, protect(roles.student),
  ctx => ctx.scene.enter(scenes.greeter.mentorRequest, { upgrade: true }))

scene.hears(buttons.home.mentor.addDirection, protect(roles.mentor),
  ctx => ctx.scene.enter(scenes.home.addMentorDirection))

scene.hears(buttons.home.mentor.myDirections, protect(roles.mentor), async ctx => {
  const { mentorRequests } = ctx.state.user
  const approvedRequests = mentorRequests
    .filter(req => [requestStatuses.approved, requestStatuses.paused].includes(req.status))
  const unapprovedRequests = userService.extractUnapprovedList(mentorRequests)
  if (!approvedRequests.length && !unapprovedRequests.length) {
    return ctx.replyWithHTML('У тебе намає жодних напрямів :c\nСкоріше додай нових!')
  }
  if (approvedRequests.length) {
    for (const request of approvedRequests) { // eslint-disable-line no-restricted-syntax
      /* eslint-disable no-await-in-loop */
      const direction = await directionService.getOne(request.directionId) //
      const message = await userService.getMentorDirectionMessage(direction.name, request)
      await ctx.reply(message.text, message.keyboard)
      /* eslint-enable no-await-in-loop */
    }
  }
  if (unapprovedRequests.length) {
    ctx.replyWithHTML(`\n\n<b>Непідтвердженні напрями:</b>\n${unapprovedRequests}`)
  }
  return true
})

scene.hears(buttons.home.mentor.mentors, protect(roles.mentor),
  async ctx => ctx.scene.enter(scenes.home.otherMentors))

scene.hears(buttons.home.student.searchMentors, protect(roles.student),
  async ctx => ctx.scene.enter(scenes.home.searchMentors))

scene.on('text', ctx => ctx.home('Скористуйся кнопками'))

module.exports = scene
