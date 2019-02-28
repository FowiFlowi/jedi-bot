const { commands, roles } = require('config')

const userService = require('../service/user')
const directionService = require('../service/direction')
const protect = require('../middlewares/protect')
const extractUsername = require('../utils/extractUsername')
const regexpCollection = require('../utils/regexpCollection')
const CustomError = require('../../errors/CustomError')

async function getUserInfo(tgId) {
  const student = await userService.getOne(tgId)
  if (!student) {
    return 'No student with such telegram id'
  }

  const { directions } = student
  const dbDirections = await directionService.get({ ids: directions.map(item => item.id) })
  const regTime = student._id.getTimestamp()
  let answer = `${extractUsername(student)}\nRegister date: <b>${regTime.toString().slice(0, 21)}</b>\n`
    + '<b>Directions:</b>\n'
  dbDirections.forEach((direction, i) => answer += `${i + 1}. ${direction.name}\n`)
  return answer
}

async function getByDirection(directionName) {
  try {
    return await userService.getByDirection(directionName, { role: roles.student, format: true })
  } catch (e) {
    if (e instanceof CustomError) {
      return e.message
    }
    throw e
  }
}

module.exports = [commands.students, protect.chat(), async ctx => {
  let [, param] = ctx.message.text.split(' ')
  if (!param) {
    return ctx.reply(await userService.getStudents({ format: true }) || 'empty')
  }
  param = param.trim()
  return regexpCollection.tgId.test(param)
    ? ctx.replyWithHTML(await getUserInfo(param))
    : ctx.replyWithHTML(await getByDirection(param))
}]
