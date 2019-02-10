const assert = require('assert').strict

const db = require('../../db')

function isDeepEqual(value1, value2) {
  try {
    assert.deepStrictEqual(value1, value2)
    return true
  } catch (e) {
    return false
  }
}

function getStorage(session) {
  const $set = {}
  const $unset = {}
  let dirty = false

  return new Proxy(session, {
    get(target, property) {
      switch (property) {
        case '__isProxy': {
          return true
        }
        case '__dirty': {
          return dirty
        }
        case '__modifier': {
          const modifier = {}
          if (Object.keys($set).length > 0) {
            Object.assign(modifier, { $set })
          }
          if (Object.keys($unset).length > 0) {
            Object.assign(modifier, { $unset })
          }
          return modifier
        }
        case 'toJSON': {
          return () => target
        }
        default: {
          return Reflect.get(target, property)
        }
      }
    },
    set(target, property, value) {
      const oldValue = target[property]
      if (!oldValue || (oldValue && !isDeepEqual(oldValue, value))) {
        dirty = true
      }
      Reflect.set(target, property, value)
      $set[`data.${property}`] = value
      delete $unset[`data.${property}`]
      return true
    },
    deleteProperty(target, property) {
      if (property in target) {
        dirty = true
      }
      Reflect.deleteProperty(target, property)
      delete $set[`data.${property}`]
      $unset[`data.${property}`] = 1
      return true
    },
  })
}

async function getSession(key) {
  const session = await db.collection('sessions').findOne({ key })
  return session ? session.data || {} : {}
}

function saveSession(key, data) {
  if (!data || !Object.keys(data).length) {
    return db.collection('sessions').deleteOne({ key })
  }
  if (!data.__dirty) {
    return false
  }
  const modifier = data.__isProxy
    ? data.__modifier
    : { $set: data }
  return db.collection('sessions').updateOne({ key }, modifier, { upsert: true })
}

function getKey(ctx) {
  if (!ctx.chat || !ctx.from) {
    return false
  }
  return `${ctx.chat.id}:${ctx.from.id}`
}

module.exports = async (ctx, next) => {
  const key = getKey(ctx)
  if (!key) {
    return next()
  }
  ctx.session = getStorage(await getSession(key))
  ctx.state.sessionKey = key
  await next()

  return saveSession(key, ctx.session)
}
