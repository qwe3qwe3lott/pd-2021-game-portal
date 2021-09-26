const delay = function (millis) {
  return new Promise((resolve) => {
    setTimeout(resolve, (millis ?? 1000))
  })
}

const charSet = 'abcdefghijklmnopqrstuvwzyx1234567890'

const generateRandomString = (stringLength) => {
  let string = ''
  for (let i = 0; i < (stringLength ?? 10); i++) {
    string += charSet[getRandomArrayIndex(charSet.length)]
  }
  return string
}

const getRandomArrayIndex = arrayLength => Math.floor(Math.random() * (arrayLength ?? 1))

module.exports = {
  delay,
  generateRandomString,
  getRandomArrayIndex
}
