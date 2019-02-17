/* eslint-disable no-param-reassign */
const { scenes } = require('config')

module.exports = bot => {
  bot.context.home = function home(msg = 'Все готово') {
    this.state.homeMessage = msg
    this.scene.enter(scenes.home.self)
  }

  bot.context.homePass = function homePass(msg = 'Оке') {
    this.state.homeMessage = msg
    this.state.sceneName = scenes.home.self
  }
}
