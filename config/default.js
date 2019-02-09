module.exports = {
  logger: {
    level: process.env.LOG_LEVEL || 'debug',
  },
  commands: {
    start: 'start',
  },
  buttons: {
    welcome: {
      mentor: '👨‍🏫 Я ментор',
      student: '👶 Ищу ментора',
    },
  },
}
