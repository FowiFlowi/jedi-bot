const db = require('../../db')

const service = {}

module.exports = service

Object.assign(service, {
  checkAcl: async id => {
    const { acl } = await db.collection('settings').findOne({})
    return acl.includes(id)
  },
})
