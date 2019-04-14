const userService = require('../service/user')
const directionService = require('../service/direction')
const getMessage = require('../utils/getMessage')

module.exports = async ctx => {
  const { data } = ctx.callbackQuery
  const [, tgId, direction] = data.split('|')
  const user = await userService.getOne(tgId)
  if (!user) {
    return ctx.answerCbQuery('User has removed')
  }
  const request = user.mentorRequests
    .find(req => req.answers.direction === direction && !req.approved && !req.disabled)
  if (!request) {
    return ctx.answerCbQuery('This request is already approved')
  }
  if (request.disabled) {
    return ctx.answerCbQuery('This request is already disabled by mentor')
  }

  const dbDirection = await directionService.upsert(request.answers.direction)
  Object.assign(request, {
    approvedBy: ctx.from.id,
    approved: true,
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
