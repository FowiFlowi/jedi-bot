const config = require('config')

const userService = require('../service/user')
const directionService = require('../service/direction')
const getMessage = require('../utils/getMessage')

const { requestStatuses } = config

module.exports = async ctx => {
  const { data } = ctx.callbackQuery
  const [, tgId, direction] = data.split('|')
  const user = await userService.getOne(tgId)
  if (!user) {
    return ctx.answerCbQuery('User has removed')
  }
  const request = user.mentorRequests
    .find(req => req.answers.direction === direction && req.status === requestStatuses.initial)
  if (!request) {
    return ctx.answerCbQuery(`No requests by this direction with ${requestStatuses.initial} status`)
  }

  const dbDirection = await directionService.upsert(request.answers.direction)
  Object.assign(request, {
    approvedBy: ctx.from.id,
    status: config.requestStatuses.approved,
    directionId: dbDirection._id,
  })
  const modifer = {
    $set: { mentorRequests: user.mentorRequests },
    $addToSet: { directions: { id: dbDirection._id } },
  }
  const { text } = getMessage.newRequest(user, request, ctx.state.user)
  const tasks = [
    ctx.answerCbQuery('<3'),
    ctx.editMessageText(text, { parse_mode: 'HTML' }),
    userService.notifyRequestApprove(tgId, direction),
    userService.update(tgId, modifer, { disableSetWrapper: true }),
  ]
  return Promise.all(tasks)
}
