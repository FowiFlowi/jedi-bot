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
  const approvedDirections = await directionService.get({ ids, format: true })
  const unapprovedDirections = userService.extractUnapprovedList(mentorRequests)
  if (!approvedDirections.length && !unapprovedDirections.length) {
    return ctx.replyWithHTML('У тебе намає жодних напрямів :c\nСкоріше додай нових!')
  }
  if (approvedDirections.length) {
    ctx.replyWithHTML(approvedDirections)
    // for (const direction of approvedDirections) { // eslint-disable-line no-restricted-syntax
    //   const { text, keyboard } = userService.getMentorDirectionMessage(tgId, direction)
    //   // eslint-disable-next-line no-await-in-loop
    //   await ctx.reply(text, keyboard)
    // }
  }
  if (unapprovedDirections.length) {
    ctx.replyWithHTML(`\n\n<b>Непідтвердженні напрями:</b>\n${unapprovedDirections}`)
  }
  return true
})

scene.hears(buttons.home.mentor.mentors, protect(roles.mentor),
  async ctx => ctx.scene.enter(scenes.home.otherMentors))

scene.hears(buttons.home.student.searchMentors, protect(roles.student),
  async ctx => ctx.scene.enter(scenes.home.searchMentors))

scene.on('text', ctx => ctx.home('Скористуйся кнопками'))

module.exports = scene
