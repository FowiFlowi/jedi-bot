const { Markup } = require('telegraf')

const extractUsername = require('./extractUsername')

module.exports = (user, request, approver) => {
  const formattedAnswers = Object.entries(request.answers)
    .reduce((text, [question, answer], indx) => text + `${indx + 1}. ${question}\n${answer}\n\n`, '')
  let text = `New request from ${extractUsername(user)}`
  if (request.isNewDirection) {
    text += ' <b>with new direction</b>'
  }
  text += `:\n\n${formattedAnswers}`
  if (approver) {
    text += `Approved by ${extractUsername(approver)}`
  }

  const keyboard = Markup.inlineKeyboard([
    Markup.callbackButton('Approve', `approve|${user.tgId}|${request.answers.direction}`),
  ]).extra()

  return { text, keyboard }
}
