const messages = require('./messages')
const buttons = require('./buttons')

module.exports = {
  db: {
    name: 'jedi-bot',
  },
  logger: {
    level: process.env.LOG_LEVEL || 'debug',
  },
  buttons,
  commands: {
    start: 'start',
    selfremove: 'selfremove',
    mentors: 'mentors',
    students: 'students',
  },
  scenes: {
    greeter: {
      self: 'greeter',
      student: 'student',
      mentorRequest: 'mentorRequest',
    },
    home: {
      self: 'home',
      addDirection: 'addDirection',
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
}
