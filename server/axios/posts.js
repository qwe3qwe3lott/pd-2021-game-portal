module.exports = function (instance) {
  return {
    sendStatistics: payload => instance.post('/statistics/add', payload)
  }
}
