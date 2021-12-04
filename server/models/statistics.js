const {
  Schema,
  model
} = require('mongoose')

const schema = new Schema({
  game: {
    type: String,
    required: true
  },
  number_of_players: {
    type: Number,
    required: false
  },
  winner: {
    type: String,
    required: false
  },
  locations_passed: {
    type: Number,
    required: false
  },
  creationTime: {
    type: Date,
    default: Date.now,
    required: true
  }
})

module.exports = model('Statistics', schema)
