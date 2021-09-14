const express = require('express')
const controller = require('../controllers/room')
const router = express.Router()

router.get('/all', controller.getAllRooms)
router.get('/add', controller.addRoom)

module.exports = router
