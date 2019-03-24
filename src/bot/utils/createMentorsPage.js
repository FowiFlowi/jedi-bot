const config = require('config')

const telegraph = require('./telegraph')
const extractUsername = require('./extractUsername')
const userService = require('../service/user')

const { requestQuestionsMap: questionsMap } = config

function getMentorNode(mentor, direction) {
  const mentorInfo = userService.getMentorInfo(mentor.mentorRequests, direction)
  Reflect.deleteProperty(mentorInfo, 'direction')
  const answers = Object.entries(mentorInfo)
    .reduce((nodes, [question, answer]) => nodes.concat({
      tag: 'b',
      children: [`${questionsMap[question]}: `],
    }, `${answer}\n`), [])
  const username = extractUsername(mentor)
  if (username.startsWith('@')) {
    return [{
      tag: 'a',
      attrs: { href: `https://t.me/${mentor.username}` },
      children: [`${username}\n`],
    }, ...answers]
  }
  return [`${username}\n`, ...answers]
}

module.exports = async mentorsByDirections => {
  const title = 'Mentors List'
  const content = []
  mentorsByDirections.forEach(item => {
    const directionNode = { tag: 'h3', children: [item.direction.name] }
    content.push(directionNode)
    const mentorsNode = { tag: 'ol', children: [] }
    item.mentors.forEach(mentor => {
      const children = getMentorNode(mentor, item.direction)
      mentorsNode.children.push({ tag: 'il', children })
    })
    content.push(mentorsNode)
  })
  if (config.disablePagesCreating) {
    return 'page creating disabled'
  }
  const { url } = await telegraph.createPage(title, content)
  return url
}
