/* eslint-disable no-console */

const config = require('config')
const lodash = require('lodash')

const db = require('../src/db')
const bot = require('../src/bot')
const userService = require('../src/bot/service/user')
const directionService = require('../src/bot/service/direction')

const directionNames = [
  'C#',
  'C/C++',
  'Ruby',
  'Python',
  'JavaScript',
  'Java',
  'Rust',
]
const BATCH_SIZE = 30

function getMentorDirections(mentorRequests) {
  return mentorRequests
    .filter(req => req.status === config.requestStatuses.approved
            && directionNames.includes(req.answers.direction))
    .map(req => req.answers.direction)
}

function getText(mentorDirections) {
  return `Привіт! 
  
  Буквально позавчора по всьому світу почався <b>Hacktoberfest</b>. Це щорічний фестиваль програмування, який проходить з 1 по 31 жовтня з метою залучення уваги до open source проектів.
  
  IT KPI огранізовує воркшоп Open Source Sprints для всіх бажаючих і тому нам потрібні ментори, які зможуть допомогти нашим товаришам познайомитися зі світом open source.
  У тебе є досвід у <b>${mentorDirections.join(', ')}</b>, тож ми звертаємось саме до тебе.
  
  Івент буде проходити 13 жовтня (неділя) у Білці. Будемо дуже вдячні, якщо зможеш бути на події, а саме допомогати учасникам котриб'ютити (потрібно буде підібрати open source ліби, або, можливо, поконтрибьютити у твій цікавий проект, та приблизно прикинути які пул реквести можна зробити).
  
  Від нас обціяємо творчу атмосферу, море спілкування і обов'язково нагодуємо :) 
      
  Якщо хочеш взяти участь (а ти нам дуже потрібний, чесно-чесно) - заповнюй форму https://bit.ly/2n4Y1Qu
  або пиши @ellyelie
  `
}

(async () => {
  await db.connect()
  const directionTasks = directionNames.map(name => directionService.getByName(name))
  const directions = await Promise.all(directionTasks)
  const directionIds = directions
    .filter(Boolean)
    .map(item => item._id)
  const mentorsQuery = {
    mentorRequests: {
      $elemMatch: {
        directionId: { $in: directionIds },
        status: config.requestStatuses.approved,
      },
    },
    roles: config.roles.mentor,
    // tgId: config.creatorId,
  }
  const mentors = await userService.get(mentorsQuery)
  const batches = lodash.chunk(mentors, BATCH_SIZE)
  for (const batch of batches) { // eslint-disable-line no-restricted-syntax
    const tasks = batch.map(async mentor => {
      try {
        const text = getText(getMentorDirections(mentor.mentorRequests))
        await bot.telegram.sendMessage(mentor.tgId, text, { parse_mode: 'HTML' })
        await bot.telegram.sendPhoto(mentor.tgId, 'AgADAgADRKwxG_3CsUh13Gn9eLi3k-zPtw8ABAEAAwIAA3kAA66SBAABFgQ')
        await userService.update(mentor.tgId, { 'distribution.hacktoberfest': new Date() })
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
