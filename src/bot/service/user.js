const config = require('config')

const service = {}

module.exports = service

const bot = require('../')
const db = require('../../db')
const directionService = require('./direction')
const extractUsername = require('../utils/extractUsername')
const getRequestMessage = require('../utils/getRequestMessage')
const regexpCollection = require('../utils/regexpCollection')
const { bot: errors } = require('../../errors')

Object.assign(service, {
  get(query = {}) {
    return db.collection('users').find(query).toArray()
  },
  async getByRole(role, ops = {}) {
    const query = { roles: role }
    const users = await service.get(query)
    if (!ops.format) {
      return users
    }
    return service.formatUsers(users)
  },
  formatUsers(users) {
    return users.map((user, i) => `${i + 1}. ${extractUsername(user)}|${user.tgId}`).join('\n')
  },
  getMentors(ops = {}) {
    return service.getByRole(config.roles.mentor, ops)
  },
  getStudents(ops = {}) {
    return service.getByRole(config.roles.student, ops)
  },
  getOneByDirection(id, ops = {}) {
    ops.getOne = true // eslint-disable-line no-param-reassign
    return service.getByDirection(id, ops)
  },
  async getByDirection(id, ops = {}) {
    if (!regexpCollection.mongoId.test(id)) {
      const direction = await directionService.getByName(id)
      if (!direction) {
        errors.noDirection()
      }
      id = direction._id // eslint-disable-line no-param-reassign
    }
    const query = { 'directions.id': id }
    if (ops.role) {
      query.roles = ops.role
    }
    if (ops.getOne) {
      return service.getOne(query)
    }
    const users = await service.get(query)
    if (!users.length) {
      errors.noUsers()
    }
    if (!ops.format) {
      return users
    }
    return service.formatUsers(users)
  },
  getOne(queryOrTgId) {
    const query = queryOrTgId instanceof Object ? queryOrTgId : { tgId: +queryOrTgId }
    return db.collection('users').findOne(query)
  },
  async upsert(user) {
    if (!user) {
      return false
    }

    const query = { tgId: user.tgId }
    const modifier = { $set: user, $currentDate: { lastModified: true } }
    const ops = { upsert: true, returnOriginal: false }
    const response = await db.collection('users').findOneAndUpdate(query, modifier, ops)
    return { user: response.value, updated: response.lastErrorObject.updatedExisting }
  },
  async update(tgId, data, ops = {}) {
    tgId = +tgId // eslint-disable-line no-param-reassign
    const query = { tgId }
    const modifier = ops.disableSetWrapper ? data : { $set: data }
    modifier.$currentDate = { lastModified: true }
    const queryOps = { returnOriginal: false }
    const { value } = await db.collection('users').findOneAndUpdate(query, modifier, queryOps)
    return value
  },
  async remove(tgId, ops = {}) {
    const query = { tgId: +tgId }
    const { value: removedUser } = await db.collection('users').findOneAndDelete(query)
    if (ops.removeFromUsers && removedUser.roles.includes(config.roles.mentor)) {
      await db.collection('users').removeDirectionsByMentor(removedUser.tgId)
    }
    return removedUser
  },
  removeDirections(directionId) {
    const modifier = { $pull: { directions: { id: directionId } } }
    return db.collection('users').updateMany({}, modifier)
  },
  removeDirectionsByMentor(mentorTgId) {
    const modifier = { $pull: { directions: { mentorTgId } } }
    return db.collection('users').updateMany({ roles: config.roles.student }, modifier)
  },
  async getStudentsByDirections(mentorTgId, directions, ops = {}) {
    const tasks = directions.map(async ({ id: directionId }) => {
      const query = {
        'directions.id': directionId,
        'directions.mentorTgId': mentorTgId,
        roles: config.roles.student,
      }
      const [students, direction] = await Promise.all([
        db.collection('users').find(query).toArray(),
        directionService.getOne(directionId),
      ])
      return { direction, students }
    })
    const studentsByDirections = await Promise.all(tasks)
    if (!ops.format) {
      return studentsByDirections
    }
    return studentsByDirections
      .map(({ direction, students }) => {
        let text = `<b>${direction.name}</b>\n`
        if (!students.length) {
          return `${text}Поки нікого`
        }
        students.forEach((student, indx) => text += `${indx + 1}. ${extractUsername(student)}\n`)
        return text
      })
      .join('\n')
  },
  addMentorRequest(tgId, direction) {
    const modifier = {
      $addToSet: { mentorRequests: { answers: { direction }, approved: false } },
    }
    // TODO: admin notification
    return service.update(tgId, modifier, { disableSetWrapper: true })
  },
  notifyNewRequest(user, request) {
    const { text, keyboard } = getRequestMessage(user, request)
    bot.telegram.sendMessage(config.adminChatId, text, keyboard)
  },
  notifyRequestApprove(tgId) {
    const message = 'Єєє, твій запит на менторство був прийнятий! Чекай на перших студентів'
    bot.telegram.sendMessage(tgId, message, { parse_mode: 'HTML' })
  },
})
