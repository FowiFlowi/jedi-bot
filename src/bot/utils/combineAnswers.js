module.exports = (user, request) => (Array.isArray(user.mentorRequests)
  ? { ...user.mentorRequests[0].answers, ...request.answers }
  : request.answers)
