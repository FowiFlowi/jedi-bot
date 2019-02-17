const { roles: { developer }, adminChatId } = require('config')

const hasUserRole = require('../utils/hasUserRole')

const protect = (role = developer) => (ctx, next) => hasUserRole(ctx.state.user, role) && next()

protect.chat = (chatId = adminChatId) => (ctx, next) => ctx.chat.id === chatId && next()

module.exports = protect
