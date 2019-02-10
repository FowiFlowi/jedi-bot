const config = require('config')
const Scene = require('telegraf/scenes/base')
const { Markup } = require('telegraf')

const {
  buttons: { greeter: { mentor, student } },
  messages,
  scenes,
} = config

const scene = new Scene(scenes.greeter.self)

scene.enter(ctx => {
  const msg = messages.welcome.replace('firstName', ctx.from.first_name)
  const keyboard = Markup.keyboard([mentor, student], { columns: 2 }).resize().extra()
  return ctx.replyWithHTML(msg, keyboard)
})

scene.hears(mentor, ctx => {
  const msg = 'krasava'
  return ctx.reply(msg)
})

scene.hears(student, async ctx => ctx.scene.enter(scenes.greeter.student))

module.exports = scene
