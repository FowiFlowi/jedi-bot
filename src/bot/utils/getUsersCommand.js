const protect = require('../middlewares/protect')
const regexpCollection = require('./regexpCollection')

const parseSkipParam = param => param && param.startsWith('skip=') ? Number(param.split('=')[1]) : 0

module.exports = (command, handlers) => [command, protect.chat(), async ctx => {
  const [, rawParam, skipParam] = ctx.message.text.split(' ')
  const param = rawParam && rawParam.trim()
  const skipNum = parseSkipParam(skipParam || param)
  if (!param || param.startsWith('skip=')) {
    const [users, count] = await Promise.all([
      handlers.getUsers({ format: true, skip: skipNum, limit: 50 }),
      handlers.getUsersCount(),
    ])
    const answer = `${users || 'empty'}\n\nCount: ${count}`
    return ctx.reply(answer)
  }
  const answer = regexpCollection.tgId.test(param)
    ? await handlers.getUserInfo(param)
    : await handlers.getByDirectionOrUsername(param, { skip: skipNum, limit: 50 })
  return ctx.replyWithHTML(answer)
}]
