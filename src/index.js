const config = require('config')
const env = require('node-env-manager')
const Koa = require('koa')
const KoaRouter = require('koa-router')
const bodyParser = require('koa-bodyparser')

const bot = require('./bot')
const logger = require('./utils/logger')
const route = require('./route')
const errorHandler = require('./middlewares/errorHandler')
const loggerMiddleware = require('./middlewares/logger')

env.init()
const app = new Koa()
const koaRouter = new KoaRouter()

app.use(errorHandler)
app.use(loggerMiddleware)
app.use(bodyParser())
app.use(route(koaRouter))

!(async () => { // eslint-disable-line
  await bot.launch()
  logger.info('Bot started with long-polling')

  app.listen(config.port, () => logger.info(`ENV:${env.get()}|Server is running on port ${config.port}`))

  app.on('error', e => {
    logger.error(e)
  })
})()
