const env = require('node-env-manager')
const { Composer } = require('telegraf')

const settingsService = require('../service/settings')

module.exports = env.isDev()
  ? Composer.acl(ctx => ctx.from && settingsService.checkAcl(ctx.from.id))
  : Composer.safePassThru()
