const messages = require('./messages')

module.exports = {
  db: {
    name: 'jedi-bot',
  },
  logger: {
    level: process.env.LOG_LEVEL || 'debug',
  },
  commands: {
    start: 'start',
    selfremove: 'selfremove',
  },
  buttons: {
    greeter: {
      mentor: '👨‍🏫 Я ментор',
      student: '👶 Шукаю ментора',
    },
    home: {
      student: {
        mentors: '🔍 Знайти менторів',
        myMentor: '🤔 Хто мій ментор?',
        addDirections: '📚 Додати інших направлень',
        myDirections: '📜 Мої направлення',
      },
      mentor: {

      },
      admin: {

      },
    },
  },
  scenes: {
    greeter: {
      self: 'greeter',
      student: 'student',
    },
    home: {
      self: 'home',
    },
  },
  roles: {
    student: 'student',
    mentor: 'mentor',
    admin: 'admin',
    developer: 'developer',
  },
  messages,
}
