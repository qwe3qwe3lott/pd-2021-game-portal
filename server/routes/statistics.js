const express = require('express')
const controller = require('../controllers/statistics')
const router = express.Router()

router.get('/all', controller.getStatistics)

router.post('/add', controller.addStatistics)

module.exports = router
