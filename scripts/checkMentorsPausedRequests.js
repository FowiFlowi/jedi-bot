/* eslint-disable no-console */
const config = require('config')

const db = require('../src/db')

const { requestStatuses } = config;

(async () => {
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
  process.exit()
})()
