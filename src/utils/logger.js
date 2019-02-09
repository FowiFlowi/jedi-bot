const config = require('config')
const logger = require('pino')(config.logger)

module.exports = logger
