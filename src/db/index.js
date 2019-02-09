const config = require('config')
const { MongoClient } = require('mongodb')

MongoClient.promise = Promise

module.exports = {
  async connect() {
    if (!this.db) {
      const client = await MongoClient.connect(config.db.url, { useNewUrlParser: true })
      this.db = client.db(config.db.name)
    }
  },
  collection(name) {
    return this.db.collection(name)
  },
}
