const userService = require('../service/user')
const directionService = require('../service/direction')
const getRequestMessage = require('../utils/getRequestMessage')
const { approveActionTrigger } = require('../utils/regexpCollection')

module.exports = bot => {
  bot.action(approveActionTrigger, async ctx => {
    const { data } = ctx.callbackQuery
    const [, tgId, direction] = data.split('|')
    const user = await userService.getOne(tgId)
    const request = user.mentorRequests
      .find(req => req.answers.direction === direction && !req.approved)
    if (!request) {
      return ctx.answerCbQuery('This request is already approved')
    }

    const dbDirection = await directionService.upsert(request.answers.direction)
    Object.assign(request, {
      approvedBy: ctx.from.id,
      approved: true,
      directionId: dbDirection._id,
    })
    const modifer = {
      $set: { mentorRequests: user.mentorRequests },
      $addToSet: { directions: { id: dbDirection._id, ...request.answers } },
    }
    const { text } = getRequestMessage(user, request, ctx.state.user)
    const tasks = [
      ctx.answerCbQuery('<3'),
      ctx.editMessageText(text),
      userService.notifyRequestApprove(tgId, direction),
      userService.update(tgId, modifer, { disableSetWrapper: true }),
    ]
    return Promise.all(tasks)
  })
}
