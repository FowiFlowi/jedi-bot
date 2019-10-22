const config = require('config')

const db = require('../src/db')
const bot = require('../src/bot')

const { requestStatuses } = config;

(async () => {
  try {
    await db.connect()
    const query = {
      roles: config.roles.mentor,
      'mentorRequests.status': requestStatuses.paused,
    }
    const modifier = {
      $set: { 'mentorRequests.$[req].status': requestStatuses.approved },
      $unset: { 'mentorRequests.$[req].pauseUntil': 1 },
    }
    const ops = {
      arrayFilters: [{ 'req.pauseUntil': { $lte: new Date() }, 'req.status': requestStatuses.paused }],
    }
    await db.collection('users').updateMany(query, modifier, ops)
  } catch (e) {
    await bot.telegram.sendMessage(config.creatorId, `Check mentors paused requests error: ${e.message}\n${e.stack}`)
  } finally {
    process.exit()
  }
})()
