const { name, version } = require('../../package.json'); // eslint-disable-line

module.exports = router => {
  router.get('/info', ctx => ctx.body = { name, version })
}
