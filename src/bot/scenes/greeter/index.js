const config = require('config')
const { Markup } = require('telegraf')

const Scene = require('../../utils/scene')
const escapeHtml = require('../../utils/escapeHtml')

const {
  buttons: { greeter: { mentor, student } },
  messages,
  scenes,
} = config

const scene = new Scene(scenes.greeter.self)

scene.enter(async ctx => {
  const msg = ctx.state.sceneMessage || messages.welcome.replace('firstName', escapeHtml(ctx.from.first_name))
  const keyboard = Markup.keyboard([mentor, student], { columns: 2 }).resize().extra()
  await ctx.replyWithHTML(msg, keyboard)
  return !ctx.state.sceneMessage && ctx.replyWithAnimation(config.videos.greeter)
})

scene.hears(mentor, ctx => {
  if (!ctx.state.user.username) {
    return ctx.replyWithHTML(config.messages.shouldMentorUsername)
  }
  return ctx.scene.enter(scenes.greeter.mentorRequest)
})

scene.hears(student, ctx => ctx.scene.enter(scenes.greeter.student))

module.exports = scene
