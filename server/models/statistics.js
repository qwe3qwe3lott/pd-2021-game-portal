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
    required: true
  },
  meta: {
    type: Object,
    required: true
  },
  creationTime: {
    type: Date,
    default: Date.now,
    required: true
  }
})

module.exports = model('Statistics', schema)
