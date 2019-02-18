const { roles } = require('config')

const service = {}

module.exports = service

const db = require('../../db')
const userService = require('./user')

Object.assign(service, {
  async get(ops = {}) {
    const query = ops.ids ? { _id: { $in: ops.ids } } : {}
    const directions = await db.collection('directions').find(query)
      .sort({ name: 1 })
      .toArray()

    let list = directions
    if (ops.hasMentors || ops.markHasMentors) {
      const tasks = directions.map(async direction => {
        const mentor = await userService.getOneByDirection(direction._id, { role: roles.mentor })
        return direction.hasMentors = !!mentor // eslint-disable-line no-param-reassign
      })
      await Promise.all(tasks)
      list = ops.hasMentors ? directions.filter(direction => direction.hasMentors === true) : list
    }
    return ops.format ? service.format(list, ops) : list
  },
  getOne(_id) {
    return db.collection('directions').findOne({ _id })
  },
  getByName(name) {
    return db.collection('directions').findOne({ name })
  },
  async upsert(name) {
    const query = { name }
    const modifier = { $setOnInsert: { name } }
    const ops = { upsert: true, returnOriginal: false }
    const { value } = await db.collection('directions').findOneAndUpdate(query, modifier, ops)
    return value
  },
  format(directions, ops = {}) {
    return directions.map((item, indx) => {
      let row = `<b>${indx + 1}</b>. ${item.name}`
      if (ops.markHasMentors && item.hasMentors) {
        row += '|<b>has mentors</b>'
      }
      return row
    }).join('\n')
  },
})
