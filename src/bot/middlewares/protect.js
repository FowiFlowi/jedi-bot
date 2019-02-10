const { roles: { developer } } = require('config')

const hasUserRole = require('../utils/hasUserRole')

module.exports = (role = developer) => (ctx, next) => hasUserRole(ctx.state.user, role) && next()
