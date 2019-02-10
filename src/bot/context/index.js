/* eslint-disable no-param-reassign */
const { scenes } = require('config')

module.exports = bot => {
  bot.context.home = function home(msg = 'Все готово') {
    this.state.homeMessage = msg
    this.scene.enter(scenes.home.self)
  }
}
