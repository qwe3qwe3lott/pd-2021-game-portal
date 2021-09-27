const express = require('express')
const controller = require('../controllers/user')
const router = express.Router()

router.get('/all', controller.getAllUsers)

router.get('/add', controller.addUser)
router.get('/check/:login/:password', controller.checkUser)

module.exports = router
