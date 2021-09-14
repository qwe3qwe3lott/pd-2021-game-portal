const mongoose = require('mongoose')

mongoose.connect(`mongodb+srv://${process.env.MONGO_USER_LOGIN}:${process.env.MONGO_USER_PASSWORD}@cluster0.xxhkg.mongodb.net/${process.env.MONGO_NAME_COLLECTION}`).then(() => {
  console.log('ok')
}).catch(err => console.log('err.message', err.message))

mongoose.connection.on('connected', () => {
  console.log('Mongoose connected to db')
})

process.on('SIGINT', async () => {
  await mongoose.connection.close()
  process.exit(0)
})
