const consolaGlobalInstance = require('consola')
const roomsManager = require('../objects/RoomsManager')
const SpyRoom = require('../objects/spy/SpyRoom')
const generateRandomString = require('../util/generateRandomString')

module.exports.checkRoom = function (req, res) {
  consolaGlobalInstance.log('BACKEND: ', 'check room')
  const roomId = req.query.roomId
  res.status(200).json({ exists: !!roomsManager.getById(roomId) })
}

module.exports.addRoom = function (req, res) {
  consolaGlobalInstance.log('BACKEND: ', 'addRoom')
  const data = req.body
  const originOptions = data.originOptions
  const roomId = generateRandomString(16)
  switch (data.game) {
    case 'spy':
      roomsManager.addRoom(new SpyRoom(roomId, originOptions.owner, originOptions.options, originOptions.locations))
      break
    default:
      res.status(500)
      return
  }
  res.status(200).json({ roomId })
}
