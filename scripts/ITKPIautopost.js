const config = require('config')

const bot = require('../src/bot');

(async () => {
  await bot.telegram.sendMessage(config.creatorId, 'CRON TEST')
})()
