const db = require('../../db')

const service = {}

module.exports = service

Object.assign(service, {
  async upsert(user) {
    if (!user) {
      return false
    }

    const query = { tgId: user.tgId }
    const modifier = { $set: user }
    const ops = { upsert: true, returnOriginal: false }
    const { value } = await db.collection('users').findOneAndUpdate(query, modifier, ops)
    return value
  },
  async update(tgId, data) {
    const query = { tgId }
    const modifier = { $set: data }
    const ops = { returnOriginal: false }
    const { value } = await db.collection('users').findOneAndUpdate(query, modifier, ops)
    return value
  },
  async remove(tgId) {
    const query = { tgId }
    return db.collection('users').deleteOne(query)
  },
})
