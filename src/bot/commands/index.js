const fs = require('fs')

module.exports = bot => fs.readdirSync(__dirname).forEach(file => {
  if (file === 'index.js') {
    return
  }
  bot.command(...require(`./${file}`)) // eslint-disable-line
})
