module.exports = (user, request) => ({ ...user.mentorRequests[0].answers, ...request.answers })
