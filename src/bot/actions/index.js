const approveHandler = require('./approve')
const rejectHandler = require('./reject')
const {
  approveActionTrigger,
  rejectActionTrigger,
} = require('../utils/regexpCollection')

module.exports = bot => {
  bot.action(approveActionTrigger, approveHandler)
  bot.action(rejectActionTrigger, rejectHandler)
}
