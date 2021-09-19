const {
  Schema,
  model
} = require('mongoose')

const schema = new Schema({
  originOptions: {
    type: String,
    required: true
  },
  creationTime: {
    type: Date,
    default: Date.now,
    required: true
  },
  game: {
    type: String,
    enum: ['spy'],
    required: true
  }
})

module.exports = model('Room', schema)
