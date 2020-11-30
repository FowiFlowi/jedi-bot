import { Telegraf } from 'telegraf'

import config from '@config'

const bot = new Telegraf(config.bot.telegramToken)

bot.on('text', ctx => ctx.reply('kek'))

export default bot
