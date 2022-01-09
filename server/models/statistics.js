const {
  Schema,
  model
} = require('mongoose')

const schema = new Schema({
  game: {
    type: String,
    required: true
  },
  numberOfPlayers: {
    type: Number,
    required: false
  },
  meta: {
    type: Object,
    required: false
  },
  creationTime: {
    type: Date,
    default: Date.now,
    required: true
  }
})

module.exports = model('Statistics', schema)
