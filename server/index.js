const consolaGlobalInstance = require('consola')
const express = require('express')
const cors = require('cors')
const { Nuxt, Builder } = require('nuxt')
const config = require('../nuxt.config.js')
const roomsManager = require('./objects/RoomsManager')
require('dotenv').config()
require('./config/database')

const RoomRouter = require('./routes/room')
const UserRouter = require('./routes/user')
const StatisticsRouter = require('./routes/statistics')

const app = express()

app.use(cors())

config.dev = process.env.NODE_ENV !== 'production'

async function start () {
  if (!config.dev) {
    config.server = {
      host: 'localhost',
      port: process.env.PORT || 8000
    }
  }
  const nuxt = new Nuxt(config)
  await nuxt.listen()
  consolaGlobalInstance.log('nuxt server listening', nuxt.server.options.server)

  app.use(nuxt.render)

  if (config.dev) {
    const builder = new Builder(nuxt)
    await builder.build()
  } else {
    await nuxt.ready()
  }
  consolaGlobalInstance.log('Nuxt app ready!')
  roomsManager.start()
}

app.use(express.json())
app.use(express.urlencoded())

app.use('/rooms', RoomRouter)
app.use('/users', UserRouter)
app.use('/statistics', StatisticsRouter)

if (require.main === module) {
  start()
}

module.exports = app
