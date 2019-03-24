module.exports = from => from && ({
  tgId: from.id,
  firstName: from.first_name,
  lastName: from.last_name,
  username: from.username,
})
