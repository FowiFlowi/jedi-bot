const { commands } = require('config')

const userService = require('../service/user')
const directionService = require('../service/direction')
const protect = require('../middlewares/protect')
const extractUsername = require('../utils/extractUsername')

module.exports = [commands.students, protect.chat(), async ctx => {
  const [, tgId] = ctx.message.text.split(' ')
  if (!tgId) {
    return ctx.reply(await userService.getStudents({ format: true }) || 'empty')
  }
  const student = await userService.getOne(tgId)
  if (!student) {
    return ctx.reply('No student with such telegram id')
  }
  const regTime = student._id.getTimestamp()
  let answer = `${extractUsername(student)}\nRegister date: <b>${regTime.toString().slice(0, 21)}</b>\n`
  const { directions } = student
  answer += '<b>Directions:</b>\n'
  const dbDirections = await directionService.get({ ids: directions.map(item => item.id) })
  dbDirections.forEach((direction, i) => answer += `${i + 1}. ${direction.name}\n`)
  return ctx.replyWithHTML(answer)
}]
