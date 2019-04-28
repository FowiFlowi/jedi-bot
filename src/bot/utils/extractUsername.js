function getExtended(username, firstName, lastName) {
  const firstLastName = lastName ? `${firstName} ${lastName}` : firstName
  if (username) {
    return `@${username} (${firstLastName})`
  }
  return firstLastName
}

module.exports = ({ username, firstName, lastName }, ops = {}) => {
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
