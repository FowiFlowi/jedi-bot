/* eslint-disable no-console */

const config = require('config')
const lodash = require('lodash')

const db = require('../../src/db')
const bot = require('../../src/bot')
const userService = require('../../src/bot/service/user')

const BATCH_SIZE = 30
const text = `Привіт!

MentorBot вже пів року з нами.
За цей час вдалось зібрати <b>162</b> менторів! Це дуже круто, дякуємо тобі за готовність допомогти іншим ❤️

Ми збираємо відгуки, придумали купу ідей на їх основі та обговорюємо що робити далі

Ти нам дуже в цьому допоможеш, якщо виділиш трохи часу та заповниш форму 🤘
https://forms.gle/YUfAY1qtv2E22k7r5`;

(async () => {
  await db.connect()
  const mentorsQuery = {
    roles: config.roles.mentor,
    // tgId: config.creatorId,
  }
  const mentors = await userService.get(mentorsQuery)
  const batches = lodash.chunk(mentors, BATCH_SIZE)
  for (const batch of batches) { // eslint-disable-line no-restricted-syntax
    const tasks = batch.map(async mentor => {
      try {
        await bot.telegram.sendMessage(mentor.tgId, text, { parse_mode: 'HTML', disable_notification: true })
        await bot.telegram.sendAnimation(mentor.tgId, 'CgADAgADCAUAAoOr8Eoqs1kZmBU2ARYE', { disable_notification: true })
        await userService.update(mentor.tgId, { 'distribution.mentorFeedbackForm': new Date() })
      } catch (e) {
        console.log(e)
      } finally {
        console.log(mentor._id)
      }
    })
    await Promise.all(tasks) // eslint-disable-line no-await-in-loop
  }
  process.exit()
})()
