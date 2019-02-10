module.exports = db => {
  const tasks = [
    db.collection('sessions').createIndex({ key: 1 }),
    db.collection('users').createIndex({ tgId: 1 }),
  ]
  return Promise.all(tasks)
}
