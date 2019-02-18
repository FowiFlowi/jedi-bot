const config = require('config')
const { Markup } = require('telegraf')

const Scene = require('../../utils/scene')

const {
  buttons: { greeter: { mentor, student } },
  messages,
  scenes,
} = config

const scene = new Scene(scenes.greeter.self)

scene.enter(ctx => {
  const msg = ctx.state.sceneMessage || messages.welcome.replace('firstName', ctx.from.first_name)
  const keyboard = Markup.keyboard([mentor, student], { columns: 2 }).resize().extra()
  return ctx.replyWithHTML(msg, keyboard)
})

scene.hears(mentor, ctx => ctx.scene.enter(scenes.greeter.mentorRequest))

scene.hears(student, ctx => ctx.scene.enter(scenes.greeter.student))

module.exports = scene
