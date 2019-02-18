const getSessionKey = ctx => ctx.from && ctx.chat && `${ctx.from.id}:${ctx.chat.id}`

getSessionKey.byId = id => `${id}:${id}`

module.exports = getSessionKey
