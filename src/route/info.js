const { name, version } = require(`${process.cwd()}/package.json`); // eslint-disable-line

module.exports = router => {
  router.get('/info', ctx => ctx.body = { name, version })
}
