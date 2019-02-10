const db = require('../../db')

const service = {}

module.exports = service

Object.assign(service, {
  remove(key) {
    const query = { key }
    return db.collection('sessions').deleteOne(query)
  },
})
