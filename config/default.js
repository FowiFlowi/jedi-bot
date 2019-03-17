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
    greeter: 'CgADAgAD_QIAAjscYUuiYbFLYLXa0AI',
    error: 'CgADAgAD0QIAAjscYUsW1kAJkbXB0wI',
    requestApproved: 'CgADAgAD6gIAAjscYUuOL36KSbKjKgI',
  },
  requestQuestionsMap: {
    direction: 'Направлення',
    experience: 'Досвід',
    timeAmount: 'Кількість менторських годин на день',
    linkedin: 'Linkedin',
    offline: 'Можливість офлайн зустрічей',
    city: 'Місто',
  },
  adminChatId: -322323327,
}
