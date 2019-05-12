const messages = require('./messages')
const buttons = require('./buttons')

const requestQuestions = {
  direction: 'direction',
  experience: 'experience',
  timeAmount: 'timeAmount',
  linkedin: 'linkedin',
  city: 'city',
}

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
    [requestQuestions.direction]: 'Напрям',
    [requestQuestions.experience]: 'Досвід',
    [requestQuestions.timeAmount]: 'Кількість менторських годин на тиждень',
    [requestQuestions.linkedin]: 'Linkedin',
    [requestQuestions.city]: 'Місто',
  },
  requestQuestions,
  adminChatId: -322323327,
  timeBeforeUserUpdate: 1000 * 60 * 60, // 1 hour
  mentorsTelegraphRateLimit: 5,
  requestStatuses: {
    initial: 'initial',
    approved: 'approved',
    removed: 'removed',
    paused: 'paused',
  },
  pauseTypes: {
    pause7days: 'pause7days',
    pause31days: 'pause31days',
    continue: 'continue',
  },
  pauseTypeToDays: {
    pause7days: 7,
    pause31days: 31,
  },
  chatActions: {
    typing: 'typing',
  },
}
