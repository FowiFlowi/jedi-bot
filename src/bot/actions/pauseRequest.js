const config = require('config')

const userService = require('../service/user')
const directionService = require('../service/direction')
const getKeyboard = require('../utils/getKeyboard')

const {
  requestStatuses, pauseTypeToDays,
} = config

function getRequestToPause(mentorRequests, directionId) {
  return mentorRequests
    .filter(req => req.directionId)
    .find(req => req.directionId.toString() === directionId
      && req.status === requestStatuses.approved)
}

module.exports = async ctx => {
  const { data, message: { text } } = ctx.callbackQuery
  const { user } = ctx.state
  const [pauseType, directionId] = data.split('|')

  const request = getRequestToPause(user.mentorRequests, directionId)
  if (!request) {
    return ctx.answerCbQuery('Не можу зупинити цей напрям :C', true)
  }

  const [direction] = await Promise.all([
    directionService.getOne(directionId),
    userService.pauseRequest(user.tgId, request, pauseType),
  ])

  const answer = `Готово. Твоя інформація за напрямом ${direction.name} не буде доступна ${pauseTypeToDays[pauseType]} днів.`
  return Promise.all([
    ctx.editMessageText(text, getKeyboard.pausedRequest(directionId)),
    ctx.answerCbQuery(answer, true),
  ])
}
