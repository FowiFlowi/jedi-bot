const { commands } = require('config')

const userService = require('../service/user')
const protect = require('../middlewares/protect')
const AppError = require('../../errors/AppError')

module.exports = [commands.edit, protect.chat(), async ctx => {
  const params = ctx.message.text.split(' ')
  const [, tgId, question, newAnswer] = params.map(param => param.trim())
  if (!tgId || !question || !newAnswer) {
    return ctx.reply('Usage example: /edit 123123 direction C++')
  }
  try {
    await userService.editAnswer(tgId, question, newAnswer)
  } catch (e) {
    if (e instanceof AppError) {
      return ctx.reply(e.message)
    }
    throw e
  }
  return ctx.reply('Edited')
}]
