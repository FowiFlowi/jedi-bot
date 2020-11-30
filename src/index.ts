import 'module-alias/register'
import 'dotenv-safe/config'

import bot from './bot/index';

(async () => {
    await bot.launch()
})()
