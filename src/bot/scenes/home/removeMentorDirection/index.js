const config = require('config')
const { Markup } = require('telegraf')

const Scene = require('../../../utils/scene')
const userService = require('../../../service/user')
const directionService = require('../../../service/direction')

const scene = new Scene(config.scenes.home.removeMentorDirection)

scene.enter(async ctx => {
  const { directions = [], mentorRequests } = ctx.state.user
  const ids = directions.map(item => item.id)
  const list = await directionService.get({ ids, format: true })
  const unapproved = userService.extractUnapprovedList(mentorRequests)

  let answer = ''
  if (list.length) {
    answer += `\n\n<b>Підтвердженні напрями:</b>\n${list}`
  }
  if (unapproved.length) {
    answer += `\n\n<b>Непідтвердженні напрями:</b>\n${unapproved}`
  }
  if (!answer) {
    return ctx.home('У тебе поки немає жодних запитів. Хутчіш додай нових!')
  }
  ctx.scene.state.directions = directions
  ctx.scene.state.mentorRequests = mentorRequests
  answer = `Напиши повну назву напряму, аби видалити його. Але ще раз подумай, перш ніж зробити це${answer}`
  const keyboard = Markup.keyboard([config.buttons.back]).resize().extra()
  return ctx.replyWithHTML(answer, keyboard)
})

scene.hears(config.buttons.back, ctx => ctx.home('Так, це була не найкраща ідея'))

scene.on('text', async ctx => {
  const name = ctx.message.text.trim()
  const { directions, mentorRequests } = ctx.scene.state
  const direction = await directionService.getByName(name)
  if (!direction) {
    return ctx.reply('Цей напрям відсутній. Перевір ще раз')
  }
  const isUserHasDirection = directions.find(({ id }) => id.equals(direction._id))
  const mentorRequest = mentorRequests.find(req => req.answers.direction === name)
  if (!isUserHasDirection && !mentorRequest) {
    return ctx.reply('У тебе немає запитів по цьому напряму')
  }
  const tasks = [userService.disableMentorRequest(ctx.state.user.tgId, name)]
  if (direction) {
    tasks.push(userService.removeDirection(ctx.state.user.tgId, direction._id))
  }
  await Promise.all(tasks)
  return ctx.home('Видалено')
})

module.exports = scene
