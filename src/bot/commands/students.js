const { commands, roles } = require('config')

const userService = require('../service/user')
const directionService = require('../service/direction')
const extractUsername = require('../utils/extractUsername')
const escapeHtml = require('../utils/escapeHtml')
const getUsersCommand = require('../utils/getUsersCommand')
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
  dbDirections.forEach((direction, i) => answer += `${i + 1}. ${escapeHtml(direction.name)}\n`)
  return answer
}

async function getByDirectionOrUsername(param, listOptions) {
  const { skip, limit } = listOptions
  return userService.getByDirection(param, {
    role: roles.student, skip, limit, format: true,
  })
    .catch(e => e instanceof CustomError ? undefined : Promise.reject(e))
    .then(byDirectionResult => byDirectionResult
      || userService.getByUsername(param, { role: roles.student, format: true }))
    .catch(e => e instanceof CustomError ? e.message : Promise.reject(e))
}

const handlers = {
  getUsers: userService.getStudents,
  getUsersCount: userService.getStudentsCount,
  getUserInfo,
  getByDirectionOrUsername,
}

module.exports = getUsersCommand(commands.students, handlers)
