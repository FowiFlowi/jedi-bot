const config = require('config')
const env = require('node-env-manager')
const Koa = require('koa')
const KoaRouter = require('koa-router')
const bodyParser = require('koa-bodyparser')

env.init()

const db = require('./db')
const bot = require('./bot')
const logger = require('./utils/logger')
const route = require('./route')
const errorHandler = require('./middlewares/errorHandler')
const loggerMiddleware = require('./middlewares/logger')

const app = new Koa()
const koaRouter = new KoaRouter()

app.use(errorHandler)
app.use(loggerMiddleware)
app.use(bodyParser())
app.use(route(koaRouter));

(async () => {
  logger.info(`ENV:${env.get()}`)
  await db.connect()
  logger.info('Connected to the database')
  await bot.launch()
  logger.info('Bot started with long-polling')

  app.listen(config.port, () => logger.info(`Server is running on port ${config.port}`))

  app.on('error', e => {
    logger.error(e)
  })
})()
