const approveHandler = require('./approve')
const rejectHandler = require('./reject')
const pauseRequestHandler = require('./pauseRequest')
const continueRequestHandler = require('./continueRequest')
const removeRequestHandler = require('./removeRequest')
const collection = require('../utils/regexpCollection')

module.exports = bot => {
  bot.action(collection.approveActionTrigger, approveHandler)
  bot.action(collection.rejectActionTrigger, rejectHandler)
  bot.action(collection.pauseRequest7DaysActionTrigger, pauseRequestHandler)
  bot.action(collection.pauseRequest31DaysActionTrigger, pauseRequestHandler)
  bot.action(collection.continueRequestActionTrigger, continueRequestHandler)
  bot.action(collection.removeRequestActionTrigger, removeRequestHandler)
}
