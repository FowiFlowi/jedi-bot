const config = require('config')

const userService = require('../service/user')

const { requestStatuses } = config

function getRequestToRemove(mentorRequests, directionId) {
  return mentorRequests
    .filter(req => req.directionId)
    .find(req => req.directionId.toString() === directionId
        && [requestStatuses.approved, requestStatuses.paused].includes(req.status))
}

module.exports = async ctx => {
  const { data } = ctx.callbackQuery
  const { user } = ctx.state
  const [, directionId] = data.split('|')
  const request = getRequestToRemove(user.mentorRequests, directionId)
  if (!request) {
    return ctx.answerCbQuery('Не можу видалити :c', true)
  }

  const tasks = [
    ctx.answerCbQuery('Видалено'),
    ctx.deleteMessage(),
    userService.removeMentorRequest(user.tgId, directionId),
  ]
  return Promise.all(tasks)
}
