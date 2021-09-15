const consolaGlobalInstance = require('consola')
const Room = require('../models/room.js')

module.exports.checkRoom = async function (req, res) {
  const roomId = req.query.roomId
  consolaGlobalInstance.log(req.query)
  try {
    const room = await Room.findOne({ _id: roomId })
    consolaGlobalInstance.log('room: ', room)
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

module.exports.addRoom = async function (req, res) {
  // Поменять поля
  const room = new Room({
    title: 'Hello',
    description: 'HelloHelloHello'
  })
  await room.save()
  res.status(200).json({
    roomId: room.id
  })
}
