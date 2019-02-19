module.exports = db => {
  const tasks = [
    db.collection('sessions').createIndex({ key: 1 }),
    db.collection('users').createIndex({ tgId: 1 }),
    db.collection('directions').createIndex({ name: 1 }, { unique: true }),
  ]
  return Promise.all(tasks)
}
