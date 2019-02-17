const db = require('../../db')

const service = {}

module.exports = service

Object.assign(service, {
  async get(ops = {}) {
    const query = ops.ids ? { _id: { $in: ops.ids } } : {}
    if (ops.hasMentors) {
      query.hasMentors = true
    }
    const directions = await db.collection('directions').find(query)
      .sort({ name: 1 })
      .toArray()
    return ops.format ? this.format(directions) : directions
  },
  getOne(_id) {
    return db.collection('directions').findOne({ _id })
  },
  format(directions) {
    return directions.map((item, indx) => `<b>${indx + 1}</b>. ${item.name}`).join('\n')
  },
})
