const config = require('config')
const { Markup } = require('telegraf')

const extractUsername = require('./extractUsername')
const escapeHtml = require('./escapeHtml')

const { buttons: { inline } } = config

function getRequestText(user, request) {
  const formattedAnswers = Object.entries(request.answers)
    .reduce((text, [question, answer], indx) => text + `${indx + 1}. ${question}\n${escapeHtml(answer)}\n\n`, '')
  let text = `New request from ${extractUsername(user)}:${user.tgId}`
  if (request.isNewDirection) {
    text += ' <b>with new direction</b>'
  }
  text += `\n${formattedAnswers}`
  return text
}

module.exports = {
  newRequest(user, request, approver) {
    let text = getRequestText(user, request)
    if (approver) {
      text += `Approved by ${extractUsername(approver)}`
      return { text }
    }

    const keyboard = Markup.inlineKeyboard([
      Markup.callbackButton(inline.approve, `approve|${user.tgId}|${request.answers.direction}`),
      Markup.callbackButton(inline.reject, `reject|${user.tgId}|${request.answers.direction}`),
    ]).extra()
    keyboard.parse_mode = 'HTML'

    return { text, keyboard }
  },
  rejectRequest(user, request, rejecter) {
    const text = getRequestText(user, request)
    return { text: text + `Rejected by ${extractUsername(rejecter)}` }
  },
}
