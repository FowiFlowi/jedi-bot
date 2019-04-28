const escapeHtml = require('./escapeHtml')

function getExtended(username, firstName, lastName) {
  const firstLastName = lastName ? `${firstName} ${lastName}` : firstName
  if (username) {
    return `${firstLastName} - @${username}`
  }
  return firstLastName
}

function extractUsername({ username, firstName, lastName }, ops) {
  const { extend = true } = ops
  if (extend) {
    return getExtended(username, firstName, lastName)
  }
  if (username) {
    return `@${username}`
  }
  if (lastName) {
    return `${firstName} ${lastName}`
  }
  return firstName
}

module.exports = (user, ops = {}) => {
  const result = extractUsername(user, ops)
  const { escape = true } = ops
  return escape ? escapeHtml(result) : result
}
