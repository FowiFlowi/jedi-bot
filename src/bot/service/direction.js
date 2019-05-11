const config = require('config')
const { ObjectId } = require('mongodb')

const service = {}

module.exports = service

const bot = require('../')
const db = require('../../db')
const userService = require('./user')
const escapeHtml = require('../utils/escapeHtml')
const logger = require('../../utils/logger')

Object.assign(service, {
  async get(ops = {}) {
    const query = ops.ids ? { _id: { $in: ops.ids } } : {}
    const directions = await db.collection('directions').find(query)
      .sort({ name: 1 })
      .toArray()

    let list = directions
    if (ops.hasMentors || ops.markHasMentors) {
      userService.checkMentorsPausedRequests()
        .catch(e => {
          logger.error(e)
          const msg = `Check paused requests Error: ${e.message}\n${e.stack}`
          return bot.telegram.sendMessage(config.creatorId, msg)
        })
      const tasks = directions.map(async direction => ({
        ...direction,
        hasMentors: !!(await userService.isAtLeastOneMentorExistsByDirection(direction._id)),
      }))
      const checkedList = await Promise.all(tasks)
      list = ops.hasMentors
        ? checkedList.filter(direction => direction.hasMentors === true)
        : checkedList
    }
    return ops.format ? service.format(list, ops) : list
  },
  getOne(id) {
    return db.collection('directions').findOne({ _id: ObjectId(id) })
  },
  getByName(name) {
    return db.collection('directions').findOne({ name })
  },
  async removeByName(name, ops = {}) {
    const query = { name }
    const { value: removedDirection } = await db.collection('directions').findOneAndDelete(query)
    if (ops.removeFromUsers) {
      await userService.removeDirections(removedDirection._id)
    }
    return removedDirection
  },
  async upsert(name) {
    const query = { name }
    const modifier = { $setOnInsert: { name } }
    const ops = { upsert: true, returnOriginal: false }
    const { value } = await db.collection('directions').findOneAndUpdate(query, modifier, ops)
    return value
  },
  async insert(name) {
    const { ops: [inserted] } = await db.collection('directions').insertOne({ name })
    return inserted
  },
  format(directions, ops = {}) {
    return directions.map((item, indx) => {
      let row = `${indx + 1}. <code>${escapeHtml(item.name)}</code>`
      if (ops.markHasMentors && item.hasMentors) {
        row += '|<b>has mentors</b>'
      }
      return row
    }).join('\n')
  },
})
