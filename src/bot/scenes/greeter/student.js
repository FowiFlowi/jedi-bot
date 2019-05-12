const config = require('config')
const env = require('node-env-manager')

const Scene = require('../../utils/scene')
const userService = require('../../service/user')

const scene = new Scene(config.scenes.greeter.student)

scene.enter(async ctx => {
  const data = { roles: [config.roles.student], directions: [] }
  if (env.isDev()) {
    data.roles.push(config.roles.developer)
  }
  ctx.state.user = await userService.update(ctx.from.id, data)
  return ctx.scene.enter(config.scenes.home.searchMentors)
})

module.exports = scene
