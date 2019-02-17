const db = require('../../db')
const directionService = require('./direction')
const extractUsername = require('../utils/extractUsername')

const service = {}

module.exports = service

Object.assign(service, {
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
  async getStudentsByDirections(tgId, directions, ops = {}) {
    const tasks = directions.map(async ({ id: directionId }) => {
      const query = {
        'directions.id': directionId,
        'directions.mentorTgId': tgId,
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
})
