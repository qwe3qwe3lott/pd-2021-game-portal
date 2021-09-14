const Room = require('../models/room.js')

module.exports.getAllRooms = async function (req, res) {
  const rooms = await Room.find({})
  res.status(200).json({ rooms })
}

module.exports.addRoom = async function (req, res) {
  const room = new Room({
    title: 'Hello',
    description: 'HelloHelloHello'
  })

  await room.save()
  res.send('sdgsdg')
}
