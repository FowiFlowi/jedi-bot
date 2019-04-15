const messages = require('./messages')
const buttons = require('./buttons')

module.exports = {
  db: {
    name: 'jedi-bot',
  },
  logger: {
    level: process.env.LOG_LEVEL || 'debug',
  },
  port: 1898,
  buttons,
  commands: {
    start: 'start',
    selfremove: 'selfremove',
    mentors: 'mentors',
    students: 'students',
    directions: 'directions',
    remove: 'remove',
    add: 'add',
    edit: 'edit',
  },
  scenes: {
    greeter: {
      self: 'greeter',
      student: 'student',
      mentorRequest: 'mentorRequest',
    },
    home: {
      self: 'home',
      addStudentDirection: 'addStudentDirection',
      addMentorDirection: 'addMentorDirection',
      removeMentorDirection: 'removeMentorDirection',
      otherMentors: 'otherMentors',
      searchMentors: 'searchMentors',
    },
  },
  roles: {
    student: 'student',
    mentor: 'mentor',
    admin: 'admin',
    developer: 'developer',
  },
  messages,
  creatorId: 147615474,
  videos: {
    greeter: 'CgADAgAD_QIAAjscYUuD5hvdecqz5wI',
    error: 'CgADAgAD0QIAAjscYUuI6wfWXlxwsgI',
    requestApproved: 'CgADAgAD6gIAAjscYUvRtvwPaPwk3QI',
  },
  requestQuestionsMap: {
    direction: 'Направлення',
    experience: 'Досвід',
    timeAmount: 'Кількість менторських годин на тиждень',
    linkedin: 'Linkedin',
    city: 'Місто',
  },
  adminChatId: -322323327,
  timeBeforeUserUpdate: 1000 * 60 * 60, // 1 hour
  mentorsTelegraphRateLimit: 10,
}
