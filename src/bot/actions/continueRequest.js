const config = require('config')

const userService = require('../service/user')
const directionService = require('../service/direction')
const getKeyboard = require('../utils/getKeyboard')

const {
  requestStatuses,
} = config

function getRequestToContinue(mentorRequests, directionId) {
  return mentorRequests
    .find(req => req.directionId && req.directionId.toString() === directionId
      && req.status === requestStatuses.paused)
}

module.exports = async ctx => {
  const { data, message: { text } } = ctx.callbackQuery
  const { user } = ctx.state
  const [, directionId] = data.split('|')

  const request = getRequestToContinue(user.mentorRequests, directionId)
  if (!request) {
    return ctx.answerCbQuery('Цей напрям ще не зупинений', true)
  }

  const [direction] = await Promise.all([
    directionService.getOne(directionId),
    userService.continueRequest(user.tgId, request),
  ])

  const answer = `Тепер твоя інформація по направленню ${direction.name} доступна всім.`
  return Promise.all([
    ctx.editMessageText(text, getKeyboard.request(directionId)),
    ctx.answerCbQuery(answer, true),
  ])
}
