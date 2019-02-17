class MongoSession {
  constructor(options) {
    this.options = {
      property: 'session',
      collection: 'sessions',
      getSessionKey: ctx => ctx.from && ctx.chat && `${ctx.from.id}:${ctx.chat.id}`,
      ...options,
    }
  }

  async getSession(key) {
    const session = await this.options.db.collection(this.options.collection).findOne({ key })
    return session
  }

  clearSession(key) {
    return this.options.db.collection(this.options.collection).deleteOne({ key })
  }

  saveSession(key, session) {
    if (!session || Object.keys(session).length === 0) {
      return this.clearSession(key)
    }
    return this.options.db.collection(this.options.collection).replaceOne({ key }, session)
  }

  middleware() {
    return async (ctx, next) => {
      const key = this.options.getSessionKey(ctx)
      if (!key) {
        return next()
      }
      let session = await this.getSession(key)
      Object.defineProperty(ctx, this.options.property, {
        get: () => session,
        set: value => session = { ...value },
      })
      await next()
      return this.saveSession(key, session)
    }
  }
}

module.exports = MongoSession
