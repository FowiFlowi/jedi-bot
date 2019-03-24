const config = require('config')
const Telegraph = require('telegra.ph')

module.exports = new Telegraph(config.telegraph.accessToken)
