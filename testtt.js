const bot = require('./src/bot');

(async () => {
  const res = await bot.telegram.getMe()
  console.log(res)
})()
