const config = require('config')

const service = {}

module.exports = service

const bot = require('../')
const db = require('../../db')
const directionService = require('./direction')
const extractUsername = require('../utils/extractUsername')
const getMessage = require('../utils/getMessage')
const regexpCollection = require('../utils/regexpCollection')
const createMentorsPage = require('../utils/createMentorsPage')
const mapFromUser = require('../utils/mapFromUser')
const combineAnswers = require('../utils/combineAnswers')
const logger = require('../../utils/logger')
const { bot: errors } = require('../../errors')

const { requestQuestionsMap: questionsMap } = config

// TODO: add notifications about new users to another users
// TODO: add FAQ/info button
// TODO: mark users that started with "Search mentor" but stopped (no desired direction)
// TODO: add statistic
// TODO: Animation for rejecting request
// TODO: Connect als

Object.assign(service, {
  async get(query = {}, listOptions = {}) {
    const { skip = 0 } = listOptions
    const users = await db.collection('users').find(query).skip(skip).toArray()
    return service.refreshUsersInfoAsync(users)
  },
  refreshUsersInfoAsync(users) {
    users.forEach(user => {
      const isMentor = user.roles && user.roles.includes(config.roles.mentor)
      const isTimeToUpdate = user.lastModified < (new Date() - config.timeBeforeUserUpdate)
      if (isMentor && isTimeToUpdate) {
        bot.telegram.getChat(user.tgId)
          .then(info => service.upsert(mapFromUser(info)))
          .catch(e => {
            logger.error(e)
            bot.telegram.sendMessage(config.creatorId, `Refresh mentor Error: ${e.message}\n${e.stack}`)
          })
      }
    })
    return users
  },
  async getByRole(role, ops = {}) {
    const query = { roles: role }
    const listOptions = { skip: ops.skip }
    const users = await service.get(query, listOptions)
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
    return service.getByDirection(id, { ...ops, getOne: true })
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
  async getOne(queryOrTgId) {
    const query = queryOrTgId instanceof Object ? queryOrTgId : { tgId: +queryOrTgId }
    const [user] = await service.get(query)
    return user
  },
  async getByUsername(username, ops = {}) {
    const query = { username }
    if (ops.role) {
      query.roles = ops.role
    }
    const [user] = await service.get(query)
    console.log('TCL: getByUsername -> user', user)
    if (!user) {
      errors.noUsers()
    }
    if (!ops.format) {
      return user
    }
    return service.formatUsers([user])
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
        service.get(query),
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
    const mentorsCount = mentorsByDirections.reduce((sum, item) => sum + item.mentors.length, 0)
    return mentorsCount > config.mentorsTelegraphRateLimit
      ? createMentorsPage(mentorsByDirections)
      : mentorsByDirections
        .map(({ direction, mentors }) => mentors.reduce((text, mentor, i) => {
          const num = `${i + 1}. `
          const info = service.getMentorInfo(mentor.mentorRequests, direction, { format: true })
          return text + `${num}${extractUsername(mentor)}${info}\n`
        }, `<b>${direction.name}</b>\n`))
        .join('\n')
  },
  getMentorInfo(mentorRequests, direction, ops = {}) {
    const request = mentorRequests
      .filter(req => req.directionId)
      .find(req => req.directionId.toString() === direction._id.toString())
    const {
      answers: {
        linkedin,
        timeAmount,
        city,
      },
    } = mentorRequests[0]
    const answers = {
      linkedin, timeAmount, city, ...request.answers,
    }
    if (!ops.format) {
      return answers
    }
    const formattedAnswers = Object.entries(answers)
      .filter(([question]) => question !== 'direction')
      .reduce((text, [question, answer]) => text + `<b>${questionsMap[question]}</b>: ${answer}\n`, '\n')
    return formattedAnswers
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
    const newRequest = { ...request, answers: combineAnswers(user, request) }
    const newRequestMsgId = await service.notifyNewRequest(user, newRequest)
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
    const message = `Єєє <b>${direction}</b>! Чекай на перших падаванів`
    await bot.telegram.sendMessage(tgId, message, { parse_mode: 'HTML' })
    return bot.telegram.sendAnimation(tgId, config.videos.requestApproved)
  },
  async notifyRequestReject(tgId, direction) {
    const message = `На жаль, твій запит по направленню <b>${direction}</b> був відхилений :c`
    return bot.telegram.sendMessage(tgId, message, { parse_mode: 'HTML' })
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
    const [mainRequest] = user.mentorRequests
    const request = user.mentorRequests.find(req => !req.approved && !req.disabled)
    if (!request) {
      return errors.noUnapprovedRequest()
    }
    if (!request.answers[question] && !mainRequest.answers[question]) {
      return errors.noRequestQuestion()
    }
    if (request.answers[question]) {
      request.answers[question] = newAsnwer
    } else {
      mainRequest.answers[question] = newAsnwer
    }
    const answers = { ...mainRequest.answers, ...request.answers }
    const newRequest = { ...request, answers }
    const { text, keyboard } = getMessage.newRequest(user, newRequest)
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
