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

scene.hears(buttons.home.mentor.myDirections, protect(roles.mentor), async ctx => {
  const { directions = [], mentorRequests } = ctx.state.user
  const unapproved = mentorRequests
    .filter(request => request.approved === false)
    .map((request, indx) => `${indx + 1}. ${request.answers.direction}`)
    .join('\n')

  const ids = directions.map(item => item.id)
  const approved = await directionService.get({ ids, format: true })
  let answer = ''
  if (approved.length) {
    answer += `<b>Підтвердженні направлення:</b>\n${approved}`
  }
  if (unapproved.length) {
    answer += `\n<b>Непідтвердженні направлення:</b>\n${unapproved}`
  }
  return ctx.replyWithHTML(answer)
})

scene.on('text', ctx => {
  const msg = 'Незабаром...'
  return ctx.reply(msg)
})

module.exports = scene
