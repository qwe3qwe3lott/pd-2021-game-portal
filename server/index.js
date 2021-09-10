const express = require('express')
const app = express()

app.get('/', function (req, res) {
  res.send('LOL')
})

module.exports = app
