const config = require('config')
const lodash = require('lodash')

const db = require('../src/db')
const bot = require('../src/bot')
const escapeHtml = require('../src/bot/utils/escapeHtml')

const REPORT_DIRECTIONS_AMOUNT = 15
const pipeline = [
  {
    $facet:
      {
        mentorsAmountPerDirection: [
          { $match: { roles: 'mentor' } },
          { $project: { mentorRequests: 1 } },
          { $unwind: '$mentorRequests' },
          { $match: { 'mentorRequests.status': { $in: ['approved', 'paused'] } } },
          { $group: { _id: '$mentorRequests.directionId', amount: { $sum: 1 } } },
          {
            $lookup: {
              from: 'directions', localField: '_id', foreignField: '_id', as: 'direction',
            },
          },
          { $project: { _id: 1, amount: 1, direction: { $arrayElemAt: ['$direction.name', 0] } } },
          { $sort: { amount: -1 } },
        ],
        directionsViews: [
          { $project: { viewedDirections: 1 } },
          { $unwind: '$viewedDirections' },
          { $group: { _id: '$viewedDirections.id', amount: { $sum: 1 } } },
          {
            $lookup: {
              from: 'directions', localField: '_id', foreignField: '_id', as: 'direction',
            },
          },
          { $project: { _id: 1, amount: 1, direction: { $arrayElemAt: ['$direction.name', 0] } } },
        ],
      },
  },
]

function getPrevStatDirectionInfo(prevStat, direction) {
  if (!prevStat) {
    return {}
  }
  const prevStatMentors = prevStat.mentorsAmountPerDirection
    .find(prevItem => prevItem.direction === direction)
  const prevStatViews = prevStat.directionsViews
    .find(prevItem => prevItem.direction === direction)
  return { prevStatMentors, prevStatViews }
}

const sortIfPrevStatExists = (prevStat, directionsViews) => (a, b) => {
  const { prevStatMentors: prevStatMentorsA } = getPrevStatDirectionInfo(prevStat, a.direction)
  const { prevStatMentors: prevStatMentorsB } = getPrevStatDirectionInfo(prevStat, b.direction)
  if (!prevStatMentorsA) {
    return 1
  }
  if (!prevStatMentorsB) {
    return -1
  }
  const mentorsAmountPerDirDiffA = a.amount - prevStatMentorsA.amount
  const mentorsAmountPerDirDiffB = b.amount - prevStatMentorsB.amount
  if (mentorsAmountPerDirDiffA === mentorsAmountPerDirDiffB && a.amount === b.amount) {
    const directionViewsA = directionsViews.find(view => view.direction === a.direction)
    const directionViewsB = directionsViews.find(view => view.direction === b.direction)
    if (!directionViewsA) {
      return 1
    }
    if (!directionViewsB) {
      return -1
    }
    return directionViewsA.amount > directionViewsB.amount ? -1 : 1
  }
  return mentorsAmountPerDirDiffA > mentorsAmountPerDirDiffB
    ? -1
    : 1
}

const sortWithoutPrevStat = directionsViews => (a, b) => {
  if (a.amount !== b.amount) {
    return 0
  }
  const directionViewsA = directionsViews.find(view => view.direction === a.direction)
  const directionViewsB = directionsViews.find(view => view.direction === b.direction)
  if (!directionViewsA) {
    return 1
  }
  if (!directionViewsB) {
    return -1
  }
  return directionViewsA.amount > directionViewsB.amount ? -1 : 1
}

async function createText(params) {
  const {
    studentsAmount,
    mentorsAmount,
    prevStat,
    directions,
    mentorsAmountPerDirection,
    directionsViews,
  } = params
  const studentsAmountDiff = prevStat && studentsAmount - prevStat.studentsAmount
  const mentorsAmountDiff = prevStat && mentorsAmount - prevStat.mentorsAmount
  let text = `<b>Інфа по менторству</b>\n\nКількість студентів: <code>${studentsAmount}`
  if (prevStat && studentsAmountDiff > 0) {
    text += `(+${studentsAmountDiff})`
  }
  text += `</code>\nКількість менторів: <code>${mentorsAmount.toString().padEnd(studentsAmount.toString().length)}`
  if (prevStat && mentorsAmountDiff > 0) {
    text += `(+${mentorsAmountDiff})`
  }
  text += '</code>\n\n'
  if (prevStat && prevStat.directions.length < directions.length) {
    const newDirections = lodash.differenceWith(directions, prevStat.directions, lodash.isEqual)
    const newDirectionDocs = await Promise.all(newDirections.map(dirId => db.collection('directions').findOne(dirId)))
    const newDirectionNames = newDirectionDocs.map(doc => escapeHtml(doc.name)).join(', ')
    text += `Нові напрями: <b>${newDirectionNames}</b>\n\n`
  }
  const directionsAmountText = REPORT_DIRECTIONS_AMOUNT > directions.length
    ? `<b>${directions.length}</b> напрямках`
    : `<b>${REPORT_DIRECTIONS_AMOUNT} з ${directions.length}</b> напрямків`
  text += `Кількість менторів та переглядів відповідно по ${directionsAmountText}:\n`
  const sortFn = prevStat
    ? sortIfPrevStatExists(prevStat, directionsViews)
    : sortWithoutPrevStat(directionsViews)
  mentorsAmountPerDirection
    .sort(sortFn)
    .slice(0, REPORT_DIRECTIONS_AMOUNT)
    .forEach(item => {
      const { prevStatMentors, prevStatViews } = getPrevStatDirectionInfo(prevStat, item.direction)
      const directionViews = directionsViews.find(view => view.direction === item.direction)

      const mentorsAmountPerDirDiff = prevStatMentors && item.amount - prevStatMentors.amount
      const directionViewsDiff = directionViews && prevStatViews
        && directionViews.amount - prevStatViews.amount

      text += `<b>${escapeHtml(item.direction)}</b>\n<code>`
      let mentorsAmountText = item.amount.toString()
      if (prevStatMentors && mentorsAmountPerDirDiff > 0) {
        mentorsAmountText += `(+${mentorsAmountPerDirDiff})`
      }
      text += mentorsAmountText.padEnd(6)
      if (directionViews) {
        text += ` - ${directionViews.amount.toString()}`
        if (directionViewsDiff > 0) {
          text += `(+${directionViewsDiff})`
        }
      }
      text += '\n</code>'
    })

  text += '\nЗнайти свого ментора або стати ним - @itkpi_mentor_bot'
  return text
}

(async () => {
  try {
    await db.connect()
    const t0 = new Date()
    const tasks = [
      db.collection('users').aggregate(pipeline).toArray(),
      db.collection('users').countDocuments({ roles: config.roles.student }),
      db.collection('users').countDocuments({ roles: config.roles.mentor }),
      db.collection('directions').find({}).toArray(),
      db.collection('statistic').find({}).sort({ createdAt: -1 }).limit(1)
        .toArray(),
    ]
    const [
      [{ mentorsAmountPerDirection, directionsViews }],
      studentsAmount,
      mentorsAmount,
      directions,
      [prevStat],
    ] = await Promise.all(tasks)

    const data = {
      mentorsAmountPerDirection,
      directionsViews,
      studentsAmount,
      mentorsAmount,
      createdAt: new Date(),
      directions,
      processingTime: (new Date() - t0) / 1000,
    }
    const text = await createText({
      studentsAmount,
      mentorsAmount,
      prevStat,
      directions,
      mentorsAmountPerDirection,
      directionsViews,
    })
    const id = config.reportChannelsId[process.env.REPORT_CHANNEL || 'test']
    await Promise.all([
      db.collection('statistic').insertOne(data),
      bot.telegram.sendMessage(id, text, { parse_mode: 'HTML' }),
    ])
    await bot.telegram.sendMessage(config.creatorId, 'Created report')
  } catch (e) {
    await bot.telegram.sendMessage(config.creatorId, `IT KPI autopost error: ${e.message}\n${e.stack}`)
  } finally {
    process.exit()
  }
})()
