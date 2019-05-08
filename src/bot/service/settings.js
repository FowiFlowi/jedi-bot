const db = require('../../db')

const service = {}

module.exports = service

Object.assign(service, {
  checkAcl: async id => {
    const doc = await db.collection('settings').findOne({})
    if (!doc) {
      return true
    }
    return doc.acl.includes(id)
  },
})
