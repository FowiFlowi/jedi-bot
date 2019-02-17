const { commands, roles } = require('config')

const userService = require('../service/user')
const directionService = require('../service/direction')
const protect = require('../middlewares/protect')
const extractUsername = require('../utils/extractUsername')
const regexpCollection = require('../utils/regexpCollection')
const AppError = require('../../errors/AppError')

async function getUserInfo(tgId) {
  const mentor = await userService.getOne(tgId)
  if (!mentor) {
    return 'No mentor with such telegram id'
  }
  const regTime = mentor._id.getTimestamp()
  let answer = `${extractUsername(mentor)}\nRegister date: <b>${regTime.toString().slice(0, 21)}</b>\n`
  const { directions } = mentor
  if (directions && directions.length) {
    answer += '<b>Approved directions:</b>\n'
    const dbDirections = await directionService.get({ ids: directions.map(item => item.id) })
    dbDirections.forEach((direction, i) => answer += `${i + 1}. ${direction.name}\n`)
  }
  const unapproved = mentor.mentorRequests.filter(request => request.approved !== true)
  if (unapproved.length) {
    answer += '<b>Unapproved directions:</b>\n'
    unapproved.forEach((request, i) => answer += `${i + 1}. ${request.answers.direction}\n`)
  }
  return answer
}

async function getByDirection(directionName) {
  try {
    return await userService.getByDirection(directionName, { role: roles.mentor, format: true })
  } catch (e) {
    if (e instanceof AppError) {
      return e.message
    }
    throw e
  }
}

module.exports = [commands.mentors, protect.chat(), async ctx => {
  const [, param] = ctx.message.text.split(' ')
  if (!param) {
    return ctx.reply(await userService.getMentors({ format: true }))
  }
  return regexpCollection.tgId.test(param)
    ? ctx.replyWithHTML(await getUserInfo(param))
    : ctx.replyWithHTML(await getByDirection(param))
}]
