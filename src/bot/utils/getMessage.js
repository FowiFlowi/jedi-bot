const { Markup } = require('telegraf')

const extractUsername = require('./extractUsername')

module.exports = {
  newRequest(user, request, approver) {
    const formattedAnswers = Object.entries(request.answers)
      .reduce((text, [question, answer], indx) => text + `${indx + 1}. ${question}\n${answer}\n\n`, '')
    let text = `New request from ${extractUsername(user)}:${user.tgId}`
    if (request.isNewDirection) {
      text += ' <b>with new direction</b>'
    }
    text += `\n${formattedAnswers}`
    if (approver) {
      text += `Approved by ${extractUsername(approver)}`
      return { text }
    }

    const keyboard = Markup.inlineKeyboard([
      Markup.callbackButton('Approve', `approve|${user.tgId}|${request.answers.direction}`),
    ]).extra()
    keyboard.parse_mode = 'HTML'

    return { text, keyboard }
  },
}
