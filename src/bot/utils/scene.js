const Scene = require('telegraf/scenes/base')

const sceneBaseHandler = require('./sceneBaseHandler')

module.exports = class extends Scene {
  constructor(name) {
    super(name, { handlers: [sceneBaseHandler] })
  }
}
