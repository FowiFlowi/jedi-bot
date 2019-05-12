const config = require('config')

const userService = require('../service/user')
const getMessage = require('../utils/getMessage')

const { requestStatuses } = config

module.exports = async ctx => {
  const { data } = ctx.callbackQuery
  const [, tgId, direction] = data.split('|')
  const user = await userService.getOne(tgId)
  if (!user) {
    return ctx.answerCbQuery('User has removed', true)
  }
  const request = user.mentorRequests
    .find(req => req.answers.direction === direction && req.status === requestStatuses.initial)
  if (!request) {
    return ctx.answerCbQuery(`No requests by this direction with ${requestStatuses.initial} status`, true)
  }

  const rejectInfo = {
    mentorTgId: tgId,
    newRequestMsgId: request.newRequestMsgId,
    directionName: direction,
    rejecter: ctx.from.id,
  }
  const { text } = getMessage.rejectRequest(user, request, ctx.state.user)
  const tasks = [
    ctx.answerCbQuery('<3'),
    ctx.editMessageText(text, { parse_mode: 'HTML' }),
    userService.rejectRequest(rejectInfo),
  ]
  return Promise.all(tasks)
}
