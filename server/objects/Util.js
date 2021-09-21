module.exports.delay = function (millis) {
  return new Promise((resolve) => {
    setTimeout(resolve, millis)
  })
}
