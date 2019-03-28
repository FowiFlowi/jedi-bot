const userService = require('../service/user')
const getMessage = require('../utils/getMessage')
const combineAnswers = require('../utils/combineAnswers')

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
    return ctx.answerCbQuery('This request is already approved or disabled')
  }

  request.disabled = true
  const modifer = { $set: { mentorRequests: user.mentorRequests } }

  const rejectedRequest = { ...request, answers: combineAnswers(user, request) }
  const { text } = getMessage.rejectRequest(user, rejectedRequest, ctx.state.user)
  const tasks = [
    ctx.answerCbQuery('<3'),
    ctx.editMessageText(text),
    userService.notifyRequestReject(tgId, direction),
    userService.update(tgId, modifer, { disableSetWrapper: true }),
  ]
  return Promise.all(tasks)
}
