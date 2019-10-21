const config = require('config')
const { ObjectId } = require('mongodb')
const env = require('node-env-manager')

const service = {}

module.exports = service

const bot = require('../')
const db = require('../../db')
const directionService = require('./direction')
const extractUsername = require('../utils/extractUsername')
const getMessage = require('../utils/getMessage')
const createMentorsPage = require('../utils/createMentorsPage')
const combineAnswers = require('../utils/combineAnswers')
const escapeHtml = require('../utils/escapeHtml')
const getKeyboard = require('../utils/getKeyboard')
const { bot: errors } = require('../../errors')

const {
  requestQuestionsMap: questionsMap,
  requestQuestions: questions,
  requestStatuses,
} = config

// TODO: add notifications about new users to another users
// TODO: add FAQ/info button
// TODO: mark users that started with "Search mentor" but stopped (no desired direction)
// TODO: add statistic
// TODO: Animation for rejecting request
// TODO: Connect als
// TODO: validating input messages
// TOOD: Remove baseScene util
// TODO: button for KPI chats
// TODO: rename directions to viewedDirections (database)
// TOOD: add createdAt field
// TODO: autoposting to IT KPI channel
// TODO: provide updating mentor info
// TODO: add second message "send another direction number"

Object.assign(service, {
  get(query = {}, listOptions = {}) {
    const { skip = 0, limit = 0 } = listOptions
    return db.collection('users').find(query)
      .skip(skip)
      .limit(limit)
      .toArray()
  },
  async getByRole(role, ops = {}) {
    const query = { roles: role }
    let { skip } = ops
    if (skip < 0) {
      skip = 0
    }
    const listOptions = { skip, limit: ops.limit }
    const users = await service.get(query, listOptions)
    if (!ops.format) {
      return users
    }
    return service.formatUsers(users)
  },
  getCountByRole(role) {
    const query = { roles: role }
    return db.collection('users').countDocuments(query)
  },
  formatUsers(users) {
    return users.map((user, i) => `${i + 1}. ${extractUsername(user)}|${user.tgId}`).join('\n')
  },
  getMentors(ops = {}) {
    return service.getByRole(config.roles.mentor, ops)
  },
  getMentorsCount() {
    return service.getCountByRole(config.roles.mentor)
  },
  getStudents(ops = {}) {
    return service.getByRole(config.roles.student, ops)
  },
  getStudentsCount() {
    return service.getCountByRole(config.roles.student)
  },
  async getByApprovedDirection(directionName, ops = {}) {
    const direction = await directionService.getByName(directionName)
    const query = {
      mentorRequests: {
        $elemMatch: {
          directionId: direction._id,
          status: { $in: [requestStatuses.approved, requestStatuses.paused] },
        },
      },
    }
    const users = await service.get(query, { skip: ops.skip, limit: ops.limit })
    if (!users.length) {
      errors.noUsers()
    }
    if (!ops.format) {
      return users
    }
    return service.formatUsers(users)
  },
  async getByViewedDirection(directionName, ops = {}) {
    const direction = await directionService.getByName(directionName)
    const query = {
      viewedDirections: direction._id,
    }
    if (ops.role) {
      query.roles = ops.role
    }
    const users = await service.get(query, { skip: ops.skip, limit: ops.limit })
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
    const modifier = {
      $set: user,
      $setOnInsert: { createdAt: new Date() },
      $currentDate: { lastModified: true },
    }
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
  removeDirections(id) {
    const query = {}
    const modifier = {
      $set: { 'mentorRequests.$[req].status': requestStatuses.removed },
      $pull: { viewedDirections: { id } },
    }
    const ops = {
      arrayFilters: [{ 'req.directionId': id }],
    }
    return db.collection('users').updateMany(query, modifier, ops)
  },
  async removeMentorRequest(tgId, directionId) {
    const query = {
      tgId,
      mentorRequests: {
        $elemMatch: {
          directionId: ObjectId(directionId),
          status: { $in: [requestStatuses.approved, requestStatuses.paused] },
        },
      },
    }
    const modifier = { $set: { 'mentorRequests.$.status': requestStatuses.removed } }
    const queryOps = { returnOriginal: false }
    const [direction, updateResult] = await Promise.all([
      directionService.getOne(directionId),
      db.collection('users').findOneAndUpdate(query, modifier, queryOps),
    ])
    const { value: user } = updateResult
    await service.notifyRequestRemoving(user, direction.name)
    return user
  },
  async getMentorsByDirections(directions, ops = {}) {
    const tasks = directions.map(async ({ id: directionId }) => {
      const query = {
        mentorRequests: {
          $elemMatch: {
            directionId,
            status: requestStatuses.approved,
          },
        },
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
      ? `Тримай <a href="${await createMentorsPage(mentorsByDirections)}">список</a> менторів`
      : mentorsByDirections
        .map(({ direction, mentors }) => mentors.reduce((text, mentor, i) => {
          const num = `${i + 1}. `
          const info = service.getMentorInfo(mentor.mentorRequests, direction, { format: true })
          return text + `${num}${extractUsername(mentor)}${info}\n`
        }, `<b>${escapeHtml(direction.name)}</b>\n`))
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
      .reduce(
        (text, [question, answer]) => text + (question === questions.linkedin && answer.startsWith('http')
          ? `<a href="${answer}">Linkedin</a>\n`
          : `<b>${questionsMap[question]}</b>: ${escapeHtml(answer)}\n`),
        '\n'
      )
    return formattedAnswers
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
  notifyRequestRemoving(user, directionName) {
    const message = `${extractUsername(user)} has removed his request with ${escapeHtml(directionName)} direction`
    return bot.telegram.sendMessage(config.adminChatId, message)
  },
  async notifyRequestApprove(tgId, direction) {
    const message = `Єєє <b>${escapeHtml(direction)}</b>! Чекай на перших падаванів`
    await bot.telegram.sendMessage(tgId, message, { parse_mode: 'HTML' })
    return bot.telegram.sendAnimation(tgId, config.videos.requestApproved)
  },
  async notifyRequestReject(tgId, direction) {
    const message = `На жаль, твій запит по напряму <b>${escapeHtml(direction)}</b> був відхилений :c`
    return bot.telegram.sendMessage(tgId, message, { parse_mode: 'HTML' })
  },
  addViewedDirection(tgId, directionId) {
    const modifier = { $addToSet: { viewedDirections: { id: directionId } } }
    return service.update(tgId, modifier, { disableSetWrapper: true })
  },
  async editAnswer(tgId, question, newAsnwer) {
    const user = await service.getOne(tgId)
    if (!user) {
      return errors.noUsers()
    }
    const [mainRequest] = user.mentorRequests
    const request = user.mentorRequests.find(req => req.status === requestStatuses.initial)
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
    return mentorRequests.filter(request => request.status === requestStatuses.initial)
      .map((request, indx) => `${indx + 1}. <code>${escapeHtml(request.answers.direction)}</code>`)
      .join('\n')
  },
  async getMentorDirectionMessage(directionName, request) {
    const views = await service.getDirectionViews(request.directionId)
    const text = `${directionName}\nПерегляди: ${views}`
    if (request.status === requestStatuses.approved) {
      return { text, keyboard: getKeyboard.request(request.directionId) }
    }
    return { text, keyboard: getKeyboard.pausedRequest(request.directionId) }
  },
  async pauseRequest(tgId, request, pauseType) {
    const pauseUntilDate = new Date()
    if (env.isDev()) {
      pauseUntilDate.setMinutes(pauseUntilDate.getMinutes() + 1)
    } else {
      const days = config.pauseTypeToDays[pauseType]
      pauseUntilDate.setDate(pauseUntilDate.getDate() + days)
    }

    const query = {
      tgId,
      'mentorRequests.newRequestMsgId': request.newRequestMsgId,
    }
    const modifier = {
      $set: {
        'mentorRequests.$.status': requestStatuses.paused,
        'mentorRequests.$.pauseUntil': pauseUntilDate,
      },
    }
    const queryOps = { returnOriginal: false }
    const { value } = await db.collection('users').findOneAndUpdate(query, modifier, queryOps)
    return value
  },
  async continueRequest(tgId, request) {
    const query = {
      tgId,
      'mentorRequests.newRequestMsgId': request.newRequestMsgId,
    }
    const modifier = {
      $set: { 'mentorRequests.$.status': requestStatuses.approved },
      $unset: { 'mentorRequests.$.pauseUntil': 1 },
    }
    const queryOps = { returnOriginal: false }
    const { value } = await db.collection('users').findOneAndUpdate(query, modifier, queryOps)
    return value
  },
  async approveRequest(approveInfo) {
    const {
      mentorTgId,
      newRequestMsgId,
      directionName,
      approver,
    } = approveInfo

    const direction = await directionService.upsert(directionName)
    const query = {
      tgId: Number(mentorTgId),
      'mentorRequests.newRequestMsgId': newRequestMsgId,
    }
    const modifier = {
      $set: {
        'mentorRequests.$.status': requestStatuses.approved,
        'mentorRequests.$.approvedBy': approver,
        'mentorRequests.$.directionId': direction._id,
      },
    }
    const queryOps = { returnOriginal: false }
    const { value } = await db.collection('users').findOneAndUpdate(query, modifier, queryOps)

    await service.notifyRequestApprove(mentorTgId, directionName)
    return value
  },
  async rejectRequest(rejectInfo) {
    const {
      mentorTgId,
      newRequestMsgId,
      directionName,
      rejecter,
    } = rejectInfo
    const query = {
      tgId: Number(mentorTgId),
      'mentorRequests.newRequestMsgId': newRequestMsgId,
    }
    const modifier = {
      $set: {
        'mentorRequests.$.status': requestStatuses.removed,
        'mentorRequests.$.rejectedBy': rejecter,
      },
    }
    const queryOps = { returnOriginal: false }
    const { value } = await db.collection('users').findOneAndUpdate(query, modifier, queryOps)
    await service.notifyRequestReject(mentorTgId, directionName)
    return value
  },
  isAtLeastOneMentorExistsByDirection(directionId) {
    const query = {
      roles: config.roles.mentor,
      mentorRequests: {
        $elemMatch: {
          directionId,
          status: requestStatuses.approved,
        },
      },
    }
    return db.collection('users').findOne(query)
  },
  getDirectionViews(directionId) {
    return db.collection('users').countDocuments({
      roles: config.roles.student,
      'viewedDirections.id': directionId,
    })
  },
})
