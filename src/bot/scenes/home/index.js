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

scene.hears(buttons.home.mentor.myStudents, protect(roles.mentor), async ctx => {
  const { from: { id: tgId }, state: { user: { directions } } } = ctx
  if (!directions || !directions.length) {
    return ctx.reply('У тебе відсутні підтвердженні напрвлення :c')
  }
  const answer = await userService.getStudentsByDirections(tgId, directions, { format: true })
  return ctx.replyWithHTML(answer)
})

scene.hears(buttons.home.mentor.addDirection, protect(roles.mentor),
  ctx => ctx.scene.enter(scenes.home.addDirection))

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
    .map((request, indx) => `${indx + 1}. ${request.answers.direction}`)
    .join('\n')

  let answer = ''
  if (list.length) {
    answer += `<b>Підтвердженні направлення:</b>\n${list}`
  }
  if (unapproved.length) {
    answer += `\n<b>Непідтвердженні направлення:</b>\n${unapproved}`
  }
  return ctx.replyWithHTML(answer || messageIfEmpty)
})

scene.on('text', ctx => {
  const msg = 'Незабаром...'
  return ctx.reply(msg)
})

module.exports = scene
