const config = require('config')
const { Markup } = require('telegraf')

const { roles, buttons, pauseTypes } = config

module.exports = {
  home(userRoles) {
    if (userRoles.includes(roles.student)) {
      const buttonValues = Object.values(buttons.home.student)
      return Markup.keyboard(buttonValues, { columns: 2 }).resize().extra()
    }
    if (userRoles.includes(roles.mentor)) {
      const buttonValues = Object.values(buttons.home.mentor)
      return Markup.keyboard(buttonValues, { columns: 2 }).resize().extra()
    }
    return false
  },
  request(directionId) {
    return Markup.inlineKeyboard([
      Markup.callbackButton(buttons.inline.pause7days, `${pauseTypes.pause7days}|${directionId}`),
      Markup.callbackButton(buttons.inline.pause31days, `${pauseTypes.pause31days}|${directionId}`),
      Markup.callbackButton(buttons.inline.remove, `remove|${directionId}`),
    ], { columns: 2 }).extra()
  },
  pausedRequest(directionId) {
    return Markup.inlineKeyboard([
      Markup.callbackButton(buttons.inline.continue, `${pauseTypes.continue}|${directionId}`),
      Markup.callbackButton(buttons.inline.remove, `remove|${directionId}`),
    ]).extra()
  },
}
