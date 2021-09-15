const express = require('express')
const controller = require('../controllers/room')
const router = express.Router()

router.get('/check', controller.checkRoom)
router.get('/all', controller.getAllRooms)
router.post('/add', controller.addRoom)

module.exports = router
