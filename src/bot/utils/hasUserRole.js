module.exports = (user, ...roles) => user && user.roles
  && roles.reduce((res, role) => res || user.roles.includes(role), false)
