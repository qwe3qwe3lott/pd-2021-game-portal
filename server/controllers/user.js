const User = require('../models/users.js')

module.exports.getAllUsers = async function (req, res) {
  const user = await User.find({})
  res.status(200).json({ user })
}

module.exports.addUser = async function (req, res) {
  // Поменять поля
  const user = new User({
    login: 'admin',
    password: 'admin'
  })
  await user.save()
  res.status(200).json({
    roomId: 1
  })
}

module.exports.checkUser = async function (req, res) {
  const {
    login,
    password
  } = req.params
  try {
    const user = await User.findOne({
      login,
      password
    })
    res.status(200).json(
      user.id
    )
  } catch (e) {
    res.status(500).json({
      exists: false
    })
  }
}
