const config = require('config')

const bot = require('../')
const db = require('../../db')
const directionService = require('./direction')
const extractUsername = require('../utils/extractUsername')
const getRequestMessage = require('../utils/getRequestMessage')

const service = {}

module.exports = service

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
    return users.map((user, i) => `${i + 1}. ${extractUsername(user)}|${user.tgId}`).join('\n')
  },
  getMentors(ops = {}) {
    return service.getByRole(config.roles.mentor, ops)
  },
  getStudents(ops = {}) {
    return service.getByRole(config.roles.student, ops)
  },
  getOne(tgId) {
    tgId = +tgId // eslint-disable-line no-param-reassign
    return db.collection('users').findOne({ tgId })
  },
  async upsert(user) {
    if (!user) {
      return false
    }

    const query = { tgId: user.tgId }
    const modifier = { $set: user, $currentDate: { lastModified: true } }
    const ops = { upsert: true, returnOriginal: false }
    const { value } = await db.collection('users').findOneAndUpdate(query, modifier, ops)
    return value
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
  async remove(tgId) {
    const query = { tgId }
    return db.collection('users').deleteOne(query)
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
