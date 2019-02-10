const db = require('../../db')

const service = {}

module.exports = service

Object.assign(service, {
  async get(ops = {}) {
    const directions = await db.collection('directions').find({})
      .sort({ name: 1 })
      .toArray()
    return ops.format ? this.format(directions) : directions
  },
  format(directions) {
    return directions.map((item, indx) => `<b>${indx + 1}</b>. ${item.name}`).join('\n')
  },
})
