const consolaGlobalInstance = require('consola')
const Room = require('../models/room.js')

module.exports.checkRoom = async function (req, res) {
  consolaGlobalInstance.log('BACKEND: ', 'checking room')
  const roomId = req.query.roomId
  try {
    const room = await Room.findOne({ _id: roomId })
    res.status(200).json({
      exists: (room !== null)
    })
  } catch (e) {
    consolaGlobalInstance.log(e)
    res.status(500).json({
      exists: false
    })
  }
}

module.exports.getAllRooms = async function (req, res) {
  const rooms = await Room.find({})
  res.status(200).json({ rooms })
}

module.exports.getRoom = async function (req, res) {
  const roomId = req.query.roomId
  const room = await Room.findOne({ _id: roomId })
  res.status(200).json({ options: room.originOptions })
}

module.exports.addRoom = async function (req, res) {
  const data = req.body
  // Поменять поля
  const room = new Room({
    originOptions: JSON.stringify(data.originOptions),
    game: data.game
  })
  await room.save()
  res.status(200).json({
    roomId: room.id
  })
}
