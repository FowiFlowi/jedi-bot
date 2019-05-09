const { commands, roles } = require('config')

const userService = require('../service/user')
const directionService = require('../service/direction')
const extractUsername = require('../utils/extractUsername')
const escapeHtml = require('../utils/escapeHtml')
const getUsersCommand = require('../utils/getUsersCommand')
const CustomError = require('../../errors/CustomError')

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
    dbDirections.forEach((direction, i) => answer += `${i + 1}. ${escapeHtml(direction.name)}\n`)
  }
  const unapproved = mentor.mentorRequests.filter(request => request.approved !== true)
  if (unapproved.length) {
    answer += '<b>Unapproved directions:</b>\n'
    unapproved.forEach((request, i) => answer += `${i + 1}. ${escapeHtml(request.answers.direction)}\n`)
  }
  return answer
}

async function getUserInfoByUsername(username) {
  const user = await userService.getByUsername(username, { role: roles.mentor })
  return getUserInfo(user.tgId)
}

async function getByDirectionOrUsername(param, listOptions) {
  const { skip, limit } = listOptions
  return userService.getByDirection(param, {
    role: roles.mentor, skip, limit, format: true,
  })
    .catch(e => e instanceof CustomError ? undefined : Promise.reject(e))
    .then(byDirectionResult => byDirectionResult
      || getUserInfoByUsername(param))
    .catch(e => e instanceof CustomError ? e.message : Promise.reject(e))
}

const handlers = {
  getUsers: userService.getMentors,
  getUsersCount: userService.getMentorsCount,
  getUserInfo,
  getByDirectionOrUsername,
}

module.exports = getUsersCommand(commands.mentors, handlers)
