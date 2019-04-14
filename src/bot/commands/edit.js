const { commands } = require('config')

const userService = require('../service/user')
const protect = require('../middlewares/protect')
const CustomError = require('../../errors/CustomError')

module.exports = [commands.edit, protect.chat(), async ctx => {
  const params = ctx.message.text.split(' ')
  const [, tgId, question, ...newAnswerArray] = params.map(param => param.trim())
  const newAnswer = newAnswerArray.join(' ')
  if (!tgId || !question || !newAnswer) {
    return ctx.reply('Usage example: /edit 123123 direction C++')
  }
  try {
    await userService.editAnswer(tgId, question, newAnswer)
  } catch (e) {
    if (e instanceof CustomError) {
      return ctx.reply(e.message)
    }
    throw e
  }
  return ctx.reply('Edited')
}]
