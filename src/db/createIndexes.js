module.exports = db => {
  const tasks = [
    db.collection('sessions').createIndex({ key: 1 }, { unique: true }),
    db.collection('users').createIndex({ tgId: 1 }, { unique: true }),
    db.collection('directions').createIndex({ name: 1 }, { unique: true }),
  ]
  return Promise.all(tasks)
}
