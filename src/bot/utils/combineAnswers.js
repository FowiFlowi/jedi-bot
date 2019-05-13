module.exports = (user, request) => (user.mentorRequests[0]
  ? { ...user.mentorRequests[0].answers, ...request.answers }
  : request.answers)
