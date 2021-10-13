const mongoose = require('mongoose')
const consolaGlobalInstance = require('consola')

mongoose.connect(`mongodb+srv://${process.env.MONGO_USER_LOGIN}:${process.env.MONGO_USER_PASSWORD}@cluster0.xxhkg.mongodb.net/${process.env.MONGO_NAME_COLLECTION}`)
  .then(() => consolaGlobalInstance.log('Mongoose connected to db'))
  .catch(err => consolaGlobalInstance.log('err.message', err.message))

process.on('SIGINT', async () => {
  await mongoose.connection.close()
  process.exit(0)
})
