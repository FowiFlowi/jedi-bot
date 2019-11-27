/* eslint-disable no-console */
const config = require('config')
const lodash = require('lodash')

const logger = require('../src/utils/logger')
const mapFromUser = require('../src/bot/utils/mapFromUser')
const db = require('../src/db')
const bot = require('../src/bot')
const userService = require('../src/bot/service/user')

const query = {
  roles: config.roles.mentor,
  removedBot: { $ne: true },
}
const BATCH_SIZE = 20;

(async () => {
  try {
    const t0 = new Date()
    await db.connect()

    const mentors = await userService.get(query)
    const batches = lodash.chunk(mentors, BATCH_SIZE)

    for (const batch of batches) { // eslint-disable-line no-restricted-syntax
      const tasks = batch.map(async mentor => { // eslint-disable-line no-loop-func
        try {
          const info = await bot.telegram.getChat(mentor.tgId)
          return userService.upsert(mapFromUser(info))
        } catch (e) {
          logger.error(e)
          bot.telegram.sendMessage(config.creatorId, `Refresh mentor ${mentor.tgId} Error: ${e.message}\n${e.stack}`)
          return e.message.includes('chat not found') && userService.update(mentor.tgId, { removedBot: true })
        }
      })

      await Promise.all(tasks) // eslint-disable-line no-await-in-loop
    }
    const t1 = new Date()
    const updTime = (t1 - t0) / 1000
    console.log(`Update time: ${updTime}sec`)
  } catch (e) {
    await bot.telegram.sendMessage(config.creatorId, `Refresh mentors error: ${e.message}\n${e.stack}`)
  } finally {
    process.exit()
  }
})()
