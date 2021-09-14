const consola = require('consola')
const express = require('express')
const mongoose = require('mongoose')
const { Nuxt, Builder } = require('nuxt')
const config = require('../nuxt.config.js')
require('dotenv').config()

const RoomRouter = require('./routes/room')

const app = express()

config.dev = process.env.NODE_ENV !== 'production'

async function start (uri, callback) {
  if (!config.dev) {
    config.server = {
      host: 'localhost',
      port: process.env.PORT || 8000
    }
  }
  console.log('dsgsdg', `mongodb+srv://${process.env.MONGO_USER_LOGIN}:${process.env.MONGO_USER_PASSWORD}@cluster0.xxhkg.mongodb.net/${process.env.MONGO_NAME_COLLECTION}`)
  await mongoose.connect(`mongodb+srv://${process.env.MONGO_USER_LOGIN}:${process.env.MONGO_USER_PASSWORD}@cluster0.xxhkg.mongodb.net/${process.env.MONGO_NAME_COLLECTION}`, {
    useNewUrlParser: true
    // useFindAndModify: false
  })
  const nuxt = new Nuxt(config)
  await nuxt.listen()
  consola.log('nuxt server listening', nuxt.server.options.server)

  app.use(nuxt.render)

  if (config.dev) {
    const builder = new Builder(nuxt)
    await builder.build()
  } else {
    await nuxt.ready()
  }
  consola.log('Nuxt app ready!')
}

app.use('/rooms', RoomRouter)

if (require.main === module) {
  start()
}

module.exports = app
