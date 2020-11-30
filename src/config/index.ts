import Config from '@interfaces/config'

const config: Config = {
    bot: {
        telegramToken: <string>process.env.TELEGRAM_BOT_TOKEN
    }
}

export default config
