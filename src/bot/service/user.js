const config = require('config')

const service = {}

module.exports = service

const bot = require('../')
const db = require('../../db')
const directionService = require('./direction')
const extractUsername = require('../utils/extractUsername')
const getMessage = require('../utils/getMessage')
const regexpCollection = require('../utils/regexpCollection')
const { bot: errors } = require('../../errors')

// TODO: add notifications about new users to another users
// TODO: generate lists to Telegra.ph (search mentors!)
// TODO: add FAQ/info button
// TODO: mark users that started with "Search mentor" but stopped (no desired direction)
// TODO: add statistic
// TODO: add "became mentor" for students
// TODO: add logging request time
// TOOD: change logging/error loggin logic

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
    const query = { tgId: +tgId }
    const modifier = ops.disableSetWrapper ? data : { $set: data }
    modifier.$currentDate = { lastModified: true }
    if (ops.unset) {
      modifier.$unset = ops.unset
    }
    const queryOps = { returnOriginal: false }
    const { value } = await db.collection('users').findOneAndUpdate(query, modifier, queryOps)
    return value
  },
  async remove(tgId) {
    const query = { tgId: +tgId }
    const { value: removedUser } = await db.collection('users').findOneAndDelete(query)
    return removedUser
  },
  removeDirections(directionId) {
    const modifier = { $pull: { directions: { id: directionId } } }
    return db.collection('users').updateMany({}, modifier)
  },
  async removeDirection(tgId, directionId) {
    const query = { tgId }
    const modifier = { $pull: { directions: { id: directionId } } }
    const queryOps = { returnOriginal: false }
    const { value } = await db.collection('users').findOneAndUpdate(query, modifier, queryOps)
    return value
  },
  async disableMentorRequest(tgId, directionName) {
    const query = {
      tgId,
      mentorRequests: { $elemMatch: { 'answers.direction': directionName, disabled: { $ne: true } } },
    }
    const modifier = { $set: { 'mentorRequests.$.disabled': true } }
    const queryOps = { returnOriginal: false }
    const { value: user } = await db.collection('users').findOneAndUpdate(query, modifier, queryOps)
    await service.notifyRequestDisabling(user, directionName)
    return user
  },
  async getMentorsByDirections(directions, ops = {}) {
    const tasks = directions.map(async ({ id: directionId }) => {
      const query = {
        'directions.id': directionId,
        roles: config.roles.mentor,
      }
      const [mentors, direction] = await Promise.all([
        db.collection('users').find(query).toArray(),
        directionService.getOne(directionId),
      ])
      if (!mentors.length) {
        return false
      }
      return { direction, mentors }
    })
    const mentorsByDirections = (await Promise.all(tasks)).filter(item => item)
    if (!ops.format) {
      return mentorsByDirections
    }
    return mentorsByDirections
      .map(({ direction, mentors }) => {
        let text = `<b>${direction.name}</b>\n`
        mentors.forEach((mentor, i) => text += `${i + 1}. ${service.getMentorInfo(mentor, direction)}`)
        return text
      })
      .join('\n')
  },
  getMentorInfo(mentor, direction) {
    const request = mentor.mentorRequests
      .find(req => req.directionId.toString() === direction._id.toString())
    const { answers: { linkedin, timeAmount } } = mentor.mentorRequests[0]
    const { requestQuestionsMap: map } = config
    const fullAnswers = { linkedin, timeAmount, ...request.answers }
    const formattedAnswers = Object.entries(fullAnswers)
      .filter(([question]) => question !== 'direction')
      .reduce((text, [question, answer]) => text + `<b>${map[question]}</b>: ${answer}\n`, '')
    return `${extractUsername(mentor)}\n${formattedAnswers}`
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
        students.forEach((student, i) => text += `${i + 1}. ${extractUsername(student)}\n`)
        return text
      })
      .join('\n')
  },
  async addMentorRequest(user, request) {
    const newRequestMsgId = await service.notifyNewRequest(user, request)
    const modifier = { $addToSet: { mentorRequests: { ...request, newRequestMsgId } } }
    await service.update(user.tgId, modifier, { disableSetWrapper: true })
    return newRequestMsgId
  },
  async notifyNewRequest(user, request) {
    const { text, keyboard } = getMessage.newRequest(user, request)
    const { message_id: messageId } = await bot.telegram
      .sendMessage(config.adminChatId, text, keyboard)
    return messageId
  },
  notifyRequestDisabling(user, directionName) {
    const message = `${extractUsername(user)} has disabled his request with ${directionName} direction`
    return bot.telegram.sendMessage(config.adminChatId, message)
  },
  async notifyRequestApprove(tgId, direction) {
    const message = `Єєє <b>${direction}</b>! Чекай на перших студентів`
    await bot.telegram.sendMessage(tgId, message, { parse_mode: 'HTML' })
    return bot.telegram.sendAnimation(tgId, config.videos.requestApproved)
  },
  addDirection(tgId, directionId) {
    const modifier = { $addToSet: { directions: { id: directionId } } }
    return service.update(tgId, modifier, { disableSetWrapper: true })
  },
  async editAnswer(tgId, question, newAsnwer) {
    const user = await service.getOne(tgId)
    if (!user) {
      return errors.noUsers()
    }
    const request = user.mentorRequests.find(req => !req.approved)
    if (!request) {
      return errors.noUnapprovedRequest()
    }
    if (!request.answers[question]) {
      return errors.noRequestQuestion()
    }
    request.answers[question] = newAsnwer
    const { text, keyboard } = getMessage.newRequest(user, request)
    return Promise.all([
      service.update(tgId, { mentorRequests: user.mentorRequests }),
      bot.telegram.editMessageText(
        config.adminChatId,
        request.newRequestMsgId,
        undefined,
        text,
        keyboard,
      ),
    ])
  },
  extractUnapprovedList(mentorRequests) {
    return mentorRequests.filter(request => !request.approved && !request.disabled)
      .map((request, indx) => `${indx + 1}. <code>${request.answers.direction}</code>`)
      .join('\n')
  },
})
