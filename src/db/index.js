const config = require('config')
const { MongoClient } = require('mongodb')

const createIndexes = require('./createIndexes')

MongoClient.promise = Promise

module.exports = {
  async connect() {
    if (!this.db) {
      const client = await MongoClient.connect(config.db.url, { useNewUrlParser: true })
      this.db = client.db(config.db.name)
      await createIndexes(this.db)
    }
  },
  collection(name) {
    return this.db.collection(name)
  },
}
