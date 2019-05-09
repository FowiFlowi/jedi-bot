const approveHandler = require('./approve')
const rejectHandler = require('./reject')
const pauseDirectionHandler = require('./pauseDirection')
const {
  approveActionTrigger,
  rejectActionTrigger,
  pauseDirectionActionTrigger,
} = require('../utils/regexpCollection')

module.exports = bot => {
  bot.action(approveActionTrigger, approveHandler)
  bot.action(rejectActionTrigger, rejectHandler)
  bot.action(pauseDirectionActionTrigger, pauseDirectionHandler)
}
