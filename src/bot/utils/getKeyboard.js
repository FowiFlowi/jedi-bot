const { roles, buttons } = require('config')
const { Markup } = require('telegraf')

module.exports = userRoles => {
  if (userRoles.includes(roles.student)) {
    const buttonValues = Object.values(buttons.home.student)
    return Markup.keyboard(buttonValues, { columns: 2 }).resize().extra()
  }
  if (userRoles.includes(roles.mentor)) {
    const buttonValues = Object.values(buttons.home.mentor)
    return Markup.keyboard(buttonValues, { columns: 2 }).resize().extra()
  }
  return false
}
