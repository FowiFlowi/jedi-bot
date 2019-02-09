const fs = require('fs')

module.exports = router => {
  fs.readdirSync(__dirname).forEach(file => {
    if (file === 'index.js') {
      return
    }
    const route = require(`./${file}`) // eslint-disable-line
    route(router)
  })
  return router.routes()
}
