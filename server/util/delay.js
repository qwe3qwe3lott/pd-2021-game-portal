module.exports = function (millis) {
  return new Promise((resolve) => {
    setTimeout(resolve, (millis ?? 1000))
  })
}
