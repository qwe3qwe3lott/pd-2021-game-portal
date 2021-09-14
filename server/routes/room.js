const express = require('express')
const controller = require('../controllers/room')
const router = express.Router()

router.get('/all', controller.getAllRooms)

module.exports = router
